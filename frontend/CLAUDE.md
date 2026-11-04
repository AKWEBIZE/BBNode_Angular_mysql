# Bigbisort_FE — Frontend

Angular single-page app for the Bigbisort agri import/export marketplace: public storefront + contact pages, buyer dashboard, seller dashboard + onboarding wizard, admin console. Talks to the Spring Boot API in `../Bigbisort_BE` at `environment.apiBaseUrl` (`http://localhost:8081/bigbisort-imp-exp` in dev).

This file is a factual record of how the code is written today, not a style guide. See `@.claude/rules/*.md` for detail.

## Tech stack (from `package.json`, `angular.json`, `tsconfig.json`)

| Area | What is used |
|---|---|
| Framework | Angular **^20.3.15** (`@angular/core`, `forms`, `router`, `animations`, `platform-browser-dynamic`), builder `@angular/build:application`, `@angular/cli ^20.3.13`, TypeScript **~5.8.3**, RxJS **~7.5**, zone.js ~0.15 |
| Styling | SCSS per component (`schematics.style: "scss"`), `bootstrap ^5.3.8` (CSS only — no ng-bootstrap), `bootstrap-icons`, Material Symbols via `<i class="material-symbols-outlined">`, Font Awesome (`@fortawesome/fontawesome-free` classes like `fas fa-envelope`; `angular-fontawesome` is installed but component usage is uncertain), `phosphor-icons` |
| Realtime | `@stomp/stompjs ^7.3.0` over plain `ws://` (`services/websocket.service.ts`) |
| Tests | Karma + Jasmine (`ng test`) — 27 generated `*.spec.ts`, effectively unused (see coding-standards.md) |
| Compiler flags | `strict: true`, `noImplicitOverride`, `noImplicitReturns`, `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers` |

`package.json` `name` is `bigbisort-frontend`; the folder is `Bigbisort_FE`.

## Where things live

```
src/
  app/
    app.module.ts            single NgModule; declares 47 non-standalone components; imports BrowserModule,
                             AppRoutingModule, FormsModule, ReactiveFormsModule; provides AuthInterceptor + provideHttpClient
    app-routing.module.ts    all routes in one file (public shell, /login, /YWRtaW4= admin login, /onboarding/*,
                             /admin/*, /seller/*, /buyer/*)
    guards/role.guard.ts     RoleGuard (sessionStorage role vs route.data.expectedRole)
    services/*.service.ts    HttpClient wrappers, one per backend area (+ auth.interceptor.ts here too)
    shared/components/       enquiry-dialog, pagination, searchable-dropdown, status-badge
    home-dashboard/          public site shell + pages: home, about-us, products, category, contact, prdlandpg,
                             footer, 30_Products/<fruit>/ (one component per product page)
    pages/                   authenticated areas: login, register, admin-* (layout, dashboard, *-management,
                             *-interactions, audit-log), seller-layout, seller-dashboard, seller/{products,orders,
                             payments,messages}, seller-onboarding/{onboarding-layout, step1..step4},
                             buyer-layout, buyer-dashboard/{...,service/,shared/}
  environments/environment.ts | environment.prod.ts   apiBaseUrl, googleClientId
  assets/
  styles.scss                global: bootstrap-icons import only
```

**Second copy:** `bigbisort-frontend/` inside this repo is a separate, older git checkout of the same app (its own `angular.json`, `src/`). `ng serve` at the root serves **this** `src/`; edits in `bigbisort-frontend/src` are not served. Work in the root `src/`.

## Run / build

- `npm start` → `ng serve` on :4200 (hot reload). `npm run build` / `npx ng build --configuration development`.
- `npx tsc --noEmit -p tsconfig.app.json` type-checks TS only; template errors (`strictTemplates`) show up only in `ng build`/`ng serve`.
- Git branch in use: `ai_changes`.

## Rules files

@.claude/rules/architecture.md
@.claude/rules/coding-standards.md
@.claude/rules/security.md
@.claude/rules/auth.md

---
## Working in this codebase
- Before implementing any change, check the relevant section above and the existing code in that module. Match what's already there — don't introduce a new pattern, standard, or refactor unrelated code, even if it looks like an improvement.
- After completing a change that adds a new pattern, changes architecture, or touches security/auth, update the relevant file above in the same change so this stays an accurate record of the current codebase.
---
