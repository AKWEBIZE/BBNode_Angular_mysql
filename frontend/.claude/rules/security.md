# Security (what is implemented today)

This records what exists. Where something is absent it is stated as absent — no recommendations.

## Input validation

- Client-side only, per component. Template-driven forms use HTML attributes (`required`, `maxlength="6"`, `type="email"`) plus hand-written `validate()` methods that fill `errors: any = {}` (`pages/seller-onboarding/step1-identity`, `pages/register`, `pages/login`). Regexes are inline: email `^[^\s@]+@[^\s@]+\.[^\s@]+$` (login/register/step1) vs. the stricter `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` in `enquiry-dialog` — two different email rules exist.
- File uploads (`pages/seller-onboarding/step2-verification`): MIME type whitelist `image/jpeg, image/png, application/pdf` and 15 MB size check before upload (the backend limit is 10 MB per file).
- The reactive `enquiry-dialog` uses `Validators.required/minLength/maxLength/email/pattern`; submit button bound to `form.valid`.
- The backend re-validates only some of these (see `../Bigbisort_BE/.claude/rules/security.md`); the FE does not rely on server messages for field-level errors except by substring matching (`msg.toLowerCase().includes('email')`).

## Secrets and configuration

- `src/environments/environment.ts` (dev) and `environment.prod.ts`: `apiBaseUrl`, `googleClientId` (a public OAuth client id). No other config files; no runtime config fetch.
- Literal in source: `services/auth.service.ts` `registerAdmin` sends header `ADMIN_SECRET: 'SUPER_SECRET_ADMIN_TOKEN_123'`. The admin login route is obscured as `/YWRtaW4=` (base64 "admin") in `app-routing.module.ts`.
- Three services hard-code the dev API URL (`onboarding.service.ts`, `product.service.ts`, `seller.service.ts`) instead of `environment.apiBaseUrl`.

## Token / session storage

- JWT access token, role, ids and display names are kept in **`sessionStorage`** via `AuthService.set*/get*` (`accessToken`, `role`, `userId`, `sellerId`, `sellerName`, `sellerEmail`, `sellerPhone`, `buyerId`, `buyerName`, `buyerCountry`, `buyerCompany`, `adminId`, `adminName`). `logout()` removes each key individually. The refresh token returned by the backend is **not stored** anywhere on the FE, and `/auth/refresh-token` is never called.
- Tokens are never placed in URLs or query strings (0 occurrences of `token=`).
- Token expiry: `AuthInterceptor` detects 401 + "Token expired" → `AuthService.tokenExpired$` → `app.component.ts` shows `showTokenExpiredModal`; OK button calls `logout()` and navigates to `/login`.

## CORS / CSP

- Not configured on the FE side (no proxy config, no `proxy.conf.json`); the dev server calls `localhost:8081` directly and relies on the backend's CORS allow-list. No CSP meta tag in `src/index.html`.

## XSS surface

- Angular's default sanitisation applies. One `[innerHTML]` binding: `shared/components/searchable-dropdown/searchable-dropdown.component.html` renders `getHighlightedText(...)`, which wraps the matched substring of an option label in markup — the label comes from backend reference data (states/districts/countries). No `bypassSecurityTrust*` usage.

## Audit logging

- None on the FE. Diagnostic `console.log` calls remain in `guards/role.guard.ts` (prints expected/stored role on every guarded navigation) and `pages/login/login.component.ts`.

## Third-party scripts

- Google Identity Services is loaded and driven by `services/google-auth.service.ts` (`window.google.accounts.id.initialize/renderButton`); the ID token is posted to `/auth/google-login`. STOMP over `ws://` (no `wss://` handling) in `services/websocket.service.ts`.
