# Architecture (as it exists today)

Paths are relative to `src/app/`.

## Module model

- One `NgModule` (`app.module.ts`) declares every non-standalone component (47) and imports `BrowserModule`, `AppRoutingModule`, `FormsModule`, `ReactiveFormsModule`. Shared components (`shared/components/*`) are declared here too — there is no `SharedModule`.
- 8 components are `standalone: true` and are loaded lazily with `loadComponent` in `app-routing.module.ts`: `pages/seller/{orders,payments,messages,products/product-list,products/add-product,products/edit-product}`, `pages/buyer-dashboard/explore-products`, `pages/buyer-layout`. They import what they need (`imports: [CommonModule, FormsModule]`). Everything else is `standalone: false` and eagerly declared. Both styles coexist; new seller-area pages have been standalone, everything else module-based.
- No signals, no `inject()`, no `@if/@for` control flow (0 files); templates use `*ngIf`/`*ngFor` (47 files). No `async` pipe — components `subscribe()` and assign to fields; 4 places use `.toPromise()` with `async/await` (`step4-products.component.ts`).
- Change detection is default (no `OnPush` usage found).

## Routing (`app-routing.module.ts`)

```
''            HomeDashboardComponent (public shell)  → home | about | products | contact | category/:type | login |
              prdland | apple | avocado | carrot | banana | pineapple | coconut | pepper
login         LoginComponent (also reachable under the shell)
YWRtaW4=      AdminLoginComponent   ("admin" base64 — obscured admin login URL)
onboarding    OnboardingLayoutComponent → identity | verification | farm | products   (no guard)
admin         AdminLayoutComponent, canActivate RoleGuard, data.expectedRole 'ADMIN' → dashboard, sellers, buyers, orders, products, audit-logs, *-interactions
seller        SellerLayoutComponent, RoleGuard 'SELLER' → dashboard, products (lazy), orders (lazy), payments (lazy), messages (lazy)
buyer         BuyerLayoutComponent, RoleGuard 'BUYER' → '', explore (lazy), orders, newarr, WL, messages
```
Route path names are short/abbreviated in places (`newarr`, `WL`, `prdland`); product pages are one route + one component per fruit.

## Folder conventions

| Folder | Contents | Notes |
|---|---|---|
| `home-dashboard/` | public site: shell component + `home`, `about-us`, `products`, `category`, `contact`, `prdlandpg`, `footer`, `30_Products/<fruit>/` | `30_Products` holds a component per product page with near-duplicate templates (each has its own "Send Enquiry" form). |
| `pages/` | everything behind login plus `login`, `register`, `seller-onboarding` | Admin pages are flat `pages/admin-<area>/`; seller pages nest under `pages/seller/`; buyer pages nest under `pages/buyer-dashboard/`. |
| `services/` | 17 `*.service.ts` + `auth.interceptor.ts` | Most HTTP services are here. `pages/buyer-dashboard/service/` holds 4 more (`buyer-order`, `product-view`, `product`, `watch-list`) — a second `product.service.ts` exists there alongside `services/product.service.ts`. |
| `shared/components/` | `searchable-dropdown`, `pagination`, `status-badge`, `enquiry-dialog` | Reusable UI; all `standalone: false`, declared in `AppModule`. |
| `guards/` | `role.guard.ts` | Only guard. |
| `pages/buyer-dashboard/shared/`, `.../buyer-order/*.model.ts`, `.../watch-list/*.model.ts` | interfaces + utils local to the buyer area | Elsewhere, DTO interfaces are exported from the service file that uses them (`services/admin-seller-management.service.ts` exports `AdminSellerListDto`, `AdminSellerDetailDto`; `services/enquiry.service.ts` exports `EnquiryRequest`, `LoginTypeOption`). There is no `models/` folder. |

## Naming

- Files: kebab-case, Angular CLI suffixes — `x.component.ts|html|scss|spec.ts`, `x.service.ts`, `role.guard.ts`, `auth.interceptor.ts`, `x.model.ts`, `x.util.ts`. One casing slip exists: `home-dashboard/products/Products.component.scss` referenced as lower-case (Angular warns at build).
- Classes: `XComponent`, `XService`, `RoleGuard`, `AuthInterceptor`. Selectors `app-<kebab>` (`prefix: "app"` in `angular.json`). One selector diverges from its class: `pages/seller/messages` → `SellerMessagesComponent` with selector `app-messages`.
- Service methods: camelCase verbs mirroring the endpoint (`getSellers`, `updateSellerStatus`, `saveStep1`, `uploadDocument`, `completeOnboarding`). Interfaces named after the backend DTO (`AdminSellerListDto`) or `<Thing>Request`/`<Thing>Option`.
- Component fields: form state as plain public fields (`fullName = ''`, `errors: any = {}`, `isSubmitting = false`), lists as `x: any[] = []`; `any` is used freely for API payloads.

## HTTP layer

- Services are `@Injectable({ providedIn: 'root' })`, inject `HttpClient`, expose `Observable<T>` methods. Base URL: `private apiUrl = \`${environment.apiBaseUrl}/admin/sellers-mgmt\`` (or `baseUrl`) in most; **three services hard-code `http://localhost:8081/bigbisort-imp-exp`** instead (`services/onboarding.service.ts`, `services/product.service.ts`, `services/seller.service.ts`). Query strings are built by template literal (`?sellerId=${sellerId}`) in some services and `HttpParams` in the admin ones.
- `AuthInterceptor` (registered via `HTTP_INTERCEPTORS` + `provideHttpClient(withInterceptorsFromDi())`) adds the bearer token to every request.
- WebSocket: `services/websocket.service.ts` wraps one STOMP `Client` (`brokerURL` derived from `apiBaseUrl` with `ws://`), used by `services/messaging.service.ts`.

## End-to-end traces

### 1. Seller onboarding step 1 → step 2
`pages/seller-onboarding/onboarding-layout` (stepper + Back button; redirects to `/login?returnUrl=` if steps ≥2 are opened without a token) hosts child routes. `step1-identity.component.ts` (template-driven, `[(ngModel)]`) collects identity, calls `AuthService.sendOtp/verifyOtp`, then `AuthService.registerSeller` → stores `sellerId`, `userId`, `accessToken`, role via `AuthService.set*` (sessionStorage) → `router.navigate(['/onboarding/verification'])`. `step2-verification.component.ts` reads `sessionStorage.sellerId` directly and calls `OnboardingService.uploadDocument` per file; on Continue → `saveIdentityInfo` then `completeStep2` → `/onboarding/farm`. Step 4 ends with `completeOnboarding` → `/seller`.

### 2. Admin seller management
`/admin/sellers` (RoleGuard ADMIN) → `pages/admin-seller-management/admin-seller-management.component.ts` → `services/admin-seller-management.service.ts` (`HttpParams` for status/query/page/size, typed `AdminSellerListDto`) → `GET /admin/sellers-mgmt`. Status changes via `updateSellerStatus(id, status)` (`PATCH`). Uses `shared/components/pagination` and `status-badge`.

### 3. Public "Send Enquiry" modal
`home-dashboard/contact/contact.component` sets `enquiryOpen = true` (+ `selectedTopic`) from any CTA → `<app-enquiry-dialog [topic] (closed)>` (`shared/components/enquiry-dialog`, the only **reactive-forms** component: `FormBuilder`, `addControl/removeControl` on `loginType.valueChanges`) → `services/enquiry.service.ts` `getLoginTypes()` / `submit()` → `/api/enquiry`. State/district reuse `OnboardingService.getStates/getDistricts` and `app-searchable-dropdown`.
