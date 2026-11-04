# Bigbisort Backend (Node.js)

TypeScript + Express + Prisma port of the Spring Boot backend (`Bigbisort_BE`),
targeting MySQL/MariaDB so it can run as a Node.js app on Hostinger Business hosting.

## Status

Foundation and auth module are complete and verified. The remaining business
modules are listed under [Remaining work](#remaining-work).

| Module | State |
| --- | --- |
| Project scaffold, config, error handling | Done |
| Prisma schema — all 11 entities | Done |
| JWT, password hashing, auth middleware | Done |
| HAL response envelopes | Done |
| `/auth` — login, refresh, send-otp, validate-otp | Done |
| Paged responses matching `PagedResourcesAssembler` | Done |
| `/product` — add, get, filter, product_info | Done |
| `/varieties` — add, get, filter | Done |
| `/seller` — sign-in, plus `/auth/seller/sign-up` | Done |
| `/buyer` — sign-in, exist-username, email-phone-exist, plus `/auth/buyer/sign-up` | Done |
| `/buyer-order` — save, get, filter, update status, status count | Done |
| `/watch-list` — add, filter, remove, ids | Done |
| `/contact` — save-contact-info, with email | Done |
| `/api/enquiry` — submit, login-types | Done |
| `/common/sign-sign-types`, `/auth/admin/sign-up` | Done |

**All Java endpoints are now ported.** What remains is listed below.

### Context path

Spring served every route under `server.servlet.context-path:
/bigbisort-imp-exp`, and the Angular app has that prefix in its `apiUrl`
values. The Node app mounts everything under the same prefix, configurable via
`BASE_PATH` (set it to an empty string to serve from the root). `GET /health`
is also exposed outside the prefix for uptime checks.

## Running locally

```bash
npm install
cp .env.example .env     # then fill in the values
npx prisma migrate dev   # creates the schema
npm run dev
```

`GET /health` returns `{"status":"UP"}`.

## Deploying to Hostinger

Build command `npm run build`, start command `npm start`, Node 22. Set every
variable from `.env.example` in the panel's Environment variables section —
nothing secret belongs in the repository.

## Differences from the Java version

These are deliberate. Each one changes behaviour, so read before going live.

### 1. Passwords are hashed, not encrypted

The Java `AuthServiceImpl` compared the submitted password against
`encryptionUtils.decrypt(usersEntity.getSPhrase())` — a reversible cipher,
meaning anyone with the database and the key could recover every user's
password. This port uses bcrypt (cost 12).

**Consequence:** existing `sPhrase` values cannot be verified here. Legacy rows
are rejected at login by `isBcryptHash`. Before going live, either:

- have users reset their passwords, or
- run a one-off migration that decrypts each value with the original Java
  cipher and re-hashes it with bcrypt.

### 2. The JWT secret comes from the environment

`JwtUtils` had the signing key hard-coded in source and committed to git.
Anyone with repository access could mint valid tokens for any user.

Here it is `JWT_SECRET`, required at boot and at least 32 characters. **Generate
a new value** — the one in the Java repository must be treated as compromised
and never reused. Tokens signed with the old key stop working, so all sessions
end at cutover.

### 3. `/auth/login` returns tokens

The Java endpoint returned only `message` and `roles` on success — no token —
so the frontend received no usable credential. This port issues `accessToken`
and `refreshToken` on success, matching what `/auth/validate-otp` already did.

### 4. UUID storage

Postgres `UUID` columns become `CHAR(36)`, as MySQL has no native UUID type.
Values are unchanged; only the column type differs.

### 4b. The order/product join table

JPA mapped this many-to-many as `ORDERS_PRODUCT_JOIN`, with `joinColumns` and
`inverseJoinColumns` swapped — the column named `product_id` held order ids and
vice versa. Prisma manages the join table itself, as `_OrdersProductJoin` with
`A`/`B` columns.

This only matters if you migrate existing rows: the old join table cannot be
copied across directly, and the swapped columns must be read the right way
round when you do.

### 5. Varieties no longer drop four submitted fields

`VarietiesServiceImpl.addVarieties` and `addVarietiesWithProduct` both built the
entity with a builder that omitted `imageUrl`, `color`, `price_per_unit` and
`harvestDate`. The request carried those values and the columns existed, but
nothing was ever written to them — so `imageUrl` came back null for every
variety created through the API.

This reads as an oversight rather than a decision, so the port persists all
four. If you need byte-for-byte parity instead, drop them from `toCreateData`
in `src/modules/varieties/varieties.service.ts`.

### 6. Seller sign-in actually verifies the OTP

`SellerServiceImpl.sellerSignIn` only checked anything when both
`mobileNumber` and `otp` were non-empty — and even then it merely confirmed a
seller with that phone number existed. The OTP was never verified against
anything. An empty request body skipped the check entirely and returned
`{"message": "Login successfully"}`, so **anyone could obtain a successful
seller sign-in response without credentials.**

Here both fields are required, the phone must match a seller, and the OTP is
checked through Twilio, as `/auth/validate-otp` already did.

### 7. Buyer signup stores userName and password

`BuyerSignupServiceImpl.buyerSignUp` built `BuyerEntity` without `userName` or
`password`, though both columns existed. Consequences in the Java version:

- `/buyer/sign-in` could never succeed — it matched on a column that was
  always null;
- `/buyer/exist-username` always returned false.

Both fields are now persisted, and `/buyer/sign-in` verifies with bcrypt. The
Java comparison used `Base64(JSON(password))`, which is an encoding rather than
a hash and offered no protection.

### 8. Seller address is the submitted address

`SellerServiceImpl.sellerSignUp` wrote `.address(requestBean.getCity())` — the
city was saved into the address column and the submitted address was discarded.
The request's own `address` is used here.

### 9. Null seller status no longer throws

`SellerAssembler.buildModel` called `getStatus().getSellerStateValue()`
unguarded, so a seller row with a null status produced a NullPointerException.
Null is returned instead.

### 10. A product can be on more than one watch list

`WatchListEntity` mapped its product with `@OneToOne` over a join table, which
puts a unique constraint on `product_id`. Only one watch-list row could exist
per product across the whole system, so the second buyer to save a given
product would hit a constraint violation.

Modelled as one-to-many here. `addProductWatchList` is also idempotent — the
Java version inserted unconditionally, so saving the same product twice created
duplicate rows, which the frontend's saved/unsaved toggle cannot represent.

### 11. Order filter bugs

`BuyerOrderServiceImpl` had two filters that could not match:

- `shippingName` built its pattern as `" % " + text + "%"` — note the literal
  spaces around the leading wildcard — so it matched almost nothing;
- `buyerName` passed the value through `escapeForLike` and then compared with
  `equal`, so any name containing `_` or `%` gained a backslash and never
  matched.

Both are fixed. `billingCompanyName` existed on the filter bean but was never
applied to the query; it now filters as a partial match.

Order results are also sorted newest-first. The Java `PageRequest` carried no
`Sort`, leaving paged results in unspecified order — which means pages could
repeat or skip rows.

### 12. Two watch-list endpoints added

The Angular `WatchListService` calls `DELETE /watch-list/remove` and
`GET /watch-list/ids`, neither of which existed in the Java backend. Both are
implemented here.

### 13. Null relations no longer throw

`BuyerOrderAssembler` dereferenced `getBuyerEntity()` and `WatchListAssembler`
dereferenced `getProductEntity()` without a null check, so an order without a
buyer, or a watch-list row whose product had been deleted, threw a
NullPointerException. Both return null instead.

### 14. Mail credentials come from the environment

**`ContactServiceImpl` had a Gmail address and a working Gmail app password
written into the source as constants, with a second password in a trailing
comment.** Both are in the Java repository's git history.

**Revoke that app password and change the account password now.** Anyone who
has ever had access to `Bigbisort_BE` can send mail as that address, and
deleting the lines does not help — the values remain in history.

Mail settings here come from `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`,
`MAIL_PASSWORD` and `MAIL_FROM`. With none set, mail is skipped and a warning
is logged rather than the request failing.

### 15. Contact mail no longer injects raw HTML

The Thymeleaf template rendered the submitted message with `th:utext`, which
writes it as unescaped HTML. Anyone could put markup, styling or a link into
the public contact form and have it render in the recipient's mail client.

Everything interpolated into the Node templates is escaped; newlines become
`<br>` so typed line breaks still survive.

### 16. The contact record is saved before the mail is sent

Java sent the mail first and saved afterwards. Since mail errors were caught
and logged, a slow or failing SMTP server delayed every submission and a crash
between the two lost it. The row is written first here, and the mail is
dispatched without blocking the response.

### 17. The email logo is a URL, not an inlined image

The Java template inlined `updated_logo.png` as a base64 data URI, which many
mail clients block and which bloats every message. Set `MAIL_LOGO_URL` to a
hosted image; with it unset, the header renders without a logo.

### 18. Two enquiry endpoints added

The Angular `EnquiryService` calls `POST /api/enquiry` and
`GET /api/enquiry/login-types`, neither of which existed in the Java backend.
Both are implemented, storing enquiries on the `CONTACT` table, which gains
nullable `topic`, `loginType`, `state`, `district`, `companyName`, `country`
and `comments` columns. Rows written by `/contact/save-contact-info` are
unaffected.

### 19. Product creation is transactional

`ProductServiceImpl.addProduct` saved the product, then its varieties, then the
product again, with no transaction around the batch. A failure partway through
a multi-product request left earlier products committed without their
varieties. Here the whole batch runs in one Prisma transaction.

## Preserved on purpose

- **HAL envelopes.** Spring HATEOAS wrapped collections as
  `{"_embedded": {"<bean>List": [...]}}`. The Angular app reads those keys in
  14 files, so `src/common/hal.ts` reproduces the shape exactly, including
  omitting `_embedded` for empty collections.
- **The `Roles` claim** keeps its capital R, as written by the Java `JwtUtils`.
- **`/auth/send-otp` error shape.** The Java controller caught its own
  exceptions and returned `{"error": "..."}` with HTTP 200.
- **The hard-coded `Seller` role** in `/auth/validate-otp`, as in the original.
- **`estimationDateOfArrival`** stays a string. It was annotated `@Temporal`
  but typed `String`; the annotation had no effect.
- **`GET /varieties/{id}` returns `{}` for an unknown id** rather than 404, as
  `VarietiesServiceImpl.getVarieties` returned an empty bean.
- **`GET /varieties/{id}` reads the id from the query string.** The Java
  controller mapped a path variable but annotated the parameter
  `@RequestParam`, so the real contract was `?varietiesId=...`. Both forms work
  here; the query parameter wins when both are present.
- **`ProductResponseBean` has no `quantity`.** The entity stores it, the
  response bean never exposed it.
- **Product filter's `authenticationType`** matches the inherited audit column,
  which is what `root.get("authenticationType")` resolved to on `ProductEntity`.
- **Sort order** on both filters stays `DESC` on name, as in the Java
  `PageRequest`.

## Remaining work

All Java endpoints are ported. Outstanding:

- **No endpoint has run against a database.** Everything typechecks and the
  routes, validation and response shapes are verified, but no query has
  executed. Stand up MySQL, run `prisma migrate dev`, and exercise each module
  before trusting any of it.
- **Firebase Admin.** The Java `FirebaseInitializer` was a stub pointing at
  `path/to/firebase-service-account.json` and was never wired into a service,
  so there was nothing to port — but confirm nothing depended on it.
- **i18n.** `messages_en.properties` / `messages_fe.properties` drove
  `Translator`; messages here are literal English strings.
- **Endpoints the Angular app calls that exist in neither the Java backend nor
  this port:**
  - `/auth/google-login`
  - `/product/country/drop-down`
  - the whole `/admin/*-mgmt` family (sellers, buyers, orders, products, audit
    logs) and `/admin/dashboard/*`
  - `/api/onboarding/*`, `/api/ref/*`, `/api/v1/catalog/*`
- **Tests.** The Java project had one test file, so there is no suite to port.
  Nothing here has automated coverage.

## Layout

```
src/
  config/        env validation, Prisma client
  common/        errors, HAL envelopes, async wrapper
  middleware/    authenticate, requireRole, error handler
  modules/auth/  jwt, password, schema, service, routes
  integrations/  twilio
prisma/
  schema.prisma  all 11 models
```
