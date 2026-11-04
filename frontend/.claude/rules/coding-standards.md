# Coding standards (observed, not prescribed)

## Formatting

- `.editorconfig`: 2-space indent, single quotes for `.ts`, final newline, trim trailing whitespace. No ESLint or Prettier config exists in the repo; `ng lint` is not set up.
- Single quotes everywhere in TS (426 vs 0 double). Semicolons mostly present; a few dozen statement lines omit them.
- `@Component({...})` decorator body indentation is inconsistent: 34 components use 2 spaces, 22 use 4 spaces (e.g. `pages/seller-dashboard/seller-dashboard.component.ts` is 4-space, `pages/seller/orders/orders.component.ts` 2-space). Property order inside the decorator also varies (`standalone` last vs. second). Match the file you are editing.
- Import paths: absolute `src/app/...` (51 uses, e.g. `import { AuthService } from 'src/app/services/auth.service'`) and relative `./` / `../` (154 uses) both occur, often in the same file. `src/environments/environment` is always imported absolutely.
- Import order (typical): `@angular/*` first, then `rxjs`, then project files. Not enforced.
- Method bodies in some components are unindented relative to the class (`login.component.ts` `loginBuyer()`, `contact.component.ts` property blocks) — the repo has files where class members sit at column 0.
- Comments: newer files carry short "why" comments above blocks (`auth.service.ts` on sessionStorage, `websocket.service.ts`, `enquiry-dialog.component.ts`); older components have `// ✅ ...` marker comments and commented-out code left in place (`login.component.ts`, `contact.component.ts` history).

## Component style

- Class-based components with constructor injection (`constructor(private auth: AuthService, private router: Router) {}`). Field names for injected services vary: `auth` vs `authService`, `onboardingService`, `router`.
- State is plain public fields, initialised inline; API results typed as `any` (`states: any[] = []`, `next: (res: any) =>`). Typed interfaces appear in the admin services and enquiry code only.
- Lifecycle: `ngOnInit` for initial loads; `ngOnDestroy` in 17 of 56 components (those that hold a `Subscription`, interval timer, or STOMP subscription). Most `subscribe()` calls are fire-and-forget without unsubscription.
- Getters for derived template state (`get canContinue(): boolean`, `get timerDisplay()`), helper methods called from templates (`showError(name)`, `errorFor(name)`).
- Navigation with `this.router.navigate(['/path'])` or `navigateByUrl('/path')` — both used.

## Forms

- **Template-driven** is the norm: `FormsModule`, `[(ngModel)]`, `#form="ngForm"`, manual `validate(): boolean` methods filling an `errors: any = {}` object rendered under each field (29 templates use `ngModel`; pattern in `pages/seller-onboarding/step1-identity`, `pages/register`).
- **Reactive forms** exist in exactly one component: `shared/components/enquiry-dialog` (`FormBuilder`, `Validators`, dynamic `addControl/removeControl`). `ReactiveFormsModule` was added to `AppModule` for it.
- Validation regexes are duplicated from the backend beans (email, Indian mobile `^[6-9]\d{9}$`, strong password `^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*...]).{8,}$`) as inline constants/methods in the component.

## Error handling

Three coexisting patterns:
1. `subscribe({ next, error })` with the error mapped into `this.errors.<field>` by inspecting `err.error?.message` text (`step1-identity.component.ts` matches "mobile"/"email"/"username"; `register.component.ts` same) or into a general banner (`errors.general`, `submitError`).
2. `alert('❌ ...')` / `alert('✅ ...')` — 38 calls in 16 files (login, admin management pages, product CRUD). No toast/snackbar component exists.
3. `console.error('Failed to load X', err)` and swallow — 18 files, mostly for lookup/reference loads.

`AuthInterceptor` is the only global handler: on HTTP 401 whose body has `error === 'Token expired'` (or a message containing it) it calls `AuthService.notifyTokenExpired()` (`tokenExpired$` Subject); who subscribes to that Subject is not verified here. All other errors are re-thrown to the caller.

## Templates and styles

- Structural directives `*ngIf`/`*ngFor`, `[ngClass]`, `[class.x]`, `(click)`; Angular 17+ control flow (`@if`) is not used.
- Icons: Material Symbols `<i class="material-symbols-outlined">name</i>` (dashboards, contact), Font Awesome classes `<i class="fas fa-envelope">` (contact hero), Unicode emoji in text/labels (`🌿`, `✓`, `▼`) — all three appear.
- Styles are per-component SCSS with hard-coded hex colours and per-file SCSS variables (`$green-dark: #1e6b23` declared inside each component's scss); no shared variables/theme file. Bootstrap CSS is loaded globally but components mostly hand-roll layout with flex/grid. Inline `style="..."` attributes appear in templates (`step1-identity.component.html`, `contact.component.html`).
- Components share class names across files without a shared stylesheet (`.main-title`, `.subtitle`, `.chat-header`), relying on view encapsulation to keep them separate.

## Tests

- 27 `*.spec.ts` files, all the Angular CLI default "should create" test (one has a second trivial `it`). They are not maintained: specs configure `declarations: [X]` without the services/modules the component actually needs, so `ng test` would fail on injection. There is no service or guard test and no test run is part of any script other than the default `ng test`.
- Verification in practice is `ng build` (template type-checking) and manual browser testing.

## Things the code explicitly does or avoids

- Auth state is in **`sessionStorage`** (per tab), never `localStorage` — deliberate, documented in `services/auth.service.ts`.
- Many components read `sessionStorage.getItem('sellerId')`/`'buyerId'` directly instead of via `AuthService` (11 files: onboarding steps 2–4, seller products/orders/messages, buyer order/watch-list, `role.guard.ts`).
- API base URL: `environment.apiBaseUrl` in 17 services; three hard-code `http://localhost:8081/bigbisort-imp-exp` (`onboarding`, `product`, `seller` services) and will break in a prod build unless changed.
- `console.log` diagnostics are left in production code paths (`role.guard.ts` logs every check; `login.component.ts` logs the saved role).
- Google Sign-In uses Google Identity Services script + `services/google-auth.service.ts`; `googleClientId` is in `environment*.ts`.
- Admin registration sends a fixed header `ADMIN_SECRET: 'SUPER_SECRET_ADMIN_TOKEN_123'` from `auth.service.ts registerAdmin` (a literal in source).
