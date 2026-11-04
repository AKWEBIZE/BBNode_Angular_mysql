# Authentication & authorization (as wired today)

## Login flows (`pages/login/login.component.ts`, `services/auth.service.ts`)

| Flow | Call | What is stored |
|---|---|---|
| Buyer / Seller password login | `AuthService.login(username, password, 'BUYER'|'SELLER')` → `POST /auth/login` | `applyLoginResponse(res, authType)`: `role` (first of `res.roles`, `ROLE_` prefix stripped), `userId`, `buyerId`+name/country/company **or** `sellerId` (falls back to `userId`) + `sellerName`, `accessToken`. |
| Google Sign-In (buyer/seller tab) | `GoogleAuthService.renderButton(...)` → ID token → `AuthService.googleLogin(idToken, authType)` → `POST /auth/google-login` | same as above; **must check `res.accessToken`** because the backend returns 200 with only `message` on failure. |
| Admin login | `pages/admin-login` → `AuthService.loginAdmin` → `POST /api/admin/login` | `adminId`, `adminName`, `role` (ADMIN / SUPER_ADMIN / OPS), `accessToken`. |
| Seller sign-up (auto-login) | `pages/seller-onboarding/step1-identity` → `AuthService.registerSeller` → `POST /auth/seller/sign-up` | `sellerId`, `userId`, `accessToken`, `role='SELLER'`, name/email/phone. `pages/register` does the same. |
| OTP | `AuthService.sendOtp/verifyOtp` → `/auth/send-otp`, `/auth/validate-otp` | only `mobileVerified = true` in the step-1 component; the token returned by `validate-otp` is ignored. |

After login: `afterLogin()` honours `?returnUrl=` (set by `RoleGuard`), else `redirectByRole()` → `/admin/dashboard`, `/buyer`, or for sellers `handleSellerRedirect()` which calls `OnboardingService.getOnboardingStatus(sellerId)` and sends incomplete sellers to `/onboarding/<step>`, complete ones to `/seller/dashboard`.

## Sending the token

`services/auth.interceptor.ts` (`HttpInterceptor`, registered with `HTTP_INTERCEPTORS` multi + `provideHttpClient(withInterceptorsFromDi())` in `app.module.ts`): if `AuthService.getToken()` is non-null, clones the request with `Authorization: Bearer <token>`. Applied to every `HttpClient` call including public ones. On a 401 whose body is `{error:'Token expired'}` (or message contains it) it emits `tokenExpired$`; other errors pass through.

## Route protection

`guards/role.guard.ts` — a class with `canActivate(route, state)` (not implementing `CanActivate` explicitly, not a functional guard). Reads `route.data['expectedRole']` and `sessionStorage.getItem('role')`:
- `expectedRole === 'ADMIN'` accepts `ADMIN`, `SUPER_ADMIN`, `OPS`.
- otherwise exact string match.
- mismatch → `router.navigate(['/login'], { queryParams: { returnUrl: state.url } })`, returns `false`.

Applied in `app-routing.module.ts` on the three layout routes: `admin` (`expectedRole: 'ADMIN'`), `seller` (`'SELLER'`), `buyer` (`'BUYER'`); child routes inherit. **Not** applied to `/onboarding/*` — instead `pages/seller-onboarding/onboarding-layout` redirects to `/login?returnUrl=` when the current step is ≥2 and `AuthService.getToken()` is null (step 1 is the public sign-up form).

The guard checks the role string only — it does not check that a token exists or is unexpired; an expired token is only discovered when the next API call returns 401.

## Trace: a protected route

User opens `/seller/orders`:
1. Router matches `seller` → `canActivate: [RoleGuard]`, `data.expectedRole: 'SELLER'`.
2. `RoleGuard.canActivate`: `sessionStorage.role === 'SELLER'` → `true` (else redirect to `/login?returnUrl=/seller/orders`).
3. `SellerLayoutComponent` renders; child `orders` is `loadComponent` → standalone `OrdersComponent`.
4. `OrdersComponent.ngOnInit` reads `sessionStorage.getItem('sellerId')` and calls `SellerOrderService` → `POST /buyer-order/filter` with `sellerId` in the body; `AuthInterceptor` adds the bearer header; backend `BuyerOrderController` checks `AuthContext.ownsSellerId(...)`.
5. If the backend answers 401 "Token expired", the interceptor triggers the expiry modal in `app.component.ts`.

## How existing code adds a protected page

- Under an existing layout (`admin`/`seller`/`buyer`): add a child route in `app-routing.module.ts`; the parent's `RoleGuard` covers it. Seller children are added as `loadComponent` standalone components; admin and buyer children (except `explore`) as eagerly declared components in `AppModule`.
- New role-gated area: add a layout route with `canActivate: [RoleGuard], data: { expectedRole: '<ROLE>' }` — the role string must equal what `applyLoginResponse` stores (backend `ROLE_` prefix stripped).
- In the component, get the current user's id from `AuthService.getSellerId()/getBuyerId()` (auth.service) or, as most existing pages do, `sessionStorage.getItem('sellerId')` directly.

## Logout

`AuthService.logout()` clears the session keys; called from `app.component.ts` (`/home` after), `pages/admin-layout`, `pages/admin-dashboard`, `pages/buyer-dashboard/header`. No backend call is made on logout (tokens are stateless and not revoked).
