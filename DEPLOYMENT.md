# Deploying to Hostinger

Two Node.js apps on one plan: the Angular build served as static files, and the
API. Business Web Hosting allows up to five.

## 1. Create the database

hPanel → Databases → MySQL. Create a database and user, and note the host,
name, user and password. Hostinger's web plans use MariaDB, which this schema
targets.

Create it with a case-insensitive collation if you are given the choice —
`utf8mb4_general_ci`. Name lookups rely on it, and the `IgnoreCase` behaviour
of the original Java queries depends on it.

## 2. Deploy the API

hPanel → Websites → your site → add a Node.js app from the GitHub repository.

| Field | Value |
| --- | --- |
| Repository | `AKWEBIZE/BBNode_Angular_mysql` |
| Branch | `main` |
| Application type | Express |
| Node.js version | 22 |
| Root directory | `backend` |
| Build script | `build` |
| Output directory | *leave empty* — Express serves no static build |
| Entry file | `dist/server.js` |

There is no "start command" field; Hostinger runs the **Entry file** directly.
That is why `prisma migrate deploy` is part of the **build** script rather than
the start script — it would otherwise never run, and the database would stay
empty of tables.

If the build fails at the migration step with a connection error, the panel is
not passing `DATABASE_URL` to the build. Set the variables first, redeploy, and
if it still fails, run `npx prisma migrate deploy` once over SSH.

Environment variables, set in the panel and **not** in the repository:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | `mysql://user:password@host:3306/dbname` |
| `JWT_SECRET` | A new random value of at least 32 characters. Never reuse the key from the Java repository. |
| `BASE_PATH` | `/bigbisort-imp-exp` — the frontend expects it |
| `CORS_ORIGINS` | The frontend's URL, comma-separated for several |
| `PORT` | Only if the panel does not set it |
| `TWILIO_*` | Needed for OTP sign-in |
| `MAIL_*` | Needed for contact and enquiry mail. Use new credentials. |

`SHADOW_DATABASE_URL` is only for `prisma migrate dev` during development and
should not be set here.

Once it is running, `GET https://<api-host>/health` returns `{"status":"UP"}`.

## 3. Point the frontend at the API

Before deploying the frontend, set its production API URL in
`frontend/src/environments/environment.prod.ts`:

```ts
apiBaseUrl: 'https://<api-host>/bigbisort-imp-exp',
```

It currently reads `https://api.bigbisort.com/bigbisort-imp-exp`. **If that
host does not serve the new API, every request from the deployed app fails.**
Commit the change before deploying.

## 4. Deploy the frontend

| Field | Value |
| --- | --- |
| Repository | `AKWEBIZE/BBNode_Angular_mysql` |
| Branch | `main` |
| Application type | Angular |
| Node.js version | 22 |
| Root directory | `frontend` |
| Build script | `build` |
| Output directory | `dist` |
| Entry file | *leave empty* — a static build has no server |

`angular.json` flattens the build to `dist/`, so `dist/index.html` exists. An
output directory pointing at `dist/bigbisort-frontend` or `dist/browser` gives
a 403, because the folder served has no `index.html` in it.

`npm install` resolves with `--legacy-peer-deps`; Hostinger retries with that
flag automatically after the first attempt fails. Pinning `karma` to `~6.4.0`
in `frontend/package.json` removes the conflict and the retry.

## 5. Check it works

1. `GET https://<api-host>/health` → `{"status":"UP"}`
2. Open the site and load a page that fetches data, such as `/products`
3. In the browser's network tab, confirm the call goes to the API host and
   returns 200 rather than a CORS error

A CORS failure means `CORS_ORIGINS` does not list the frontend's exact origin,
including scheme and any port.

## Existing users cannot sign in

Passwords are bcrypt here. Rows carried over from the PostgreSQL database hold
values written by the Java service's reversible cipher, which this backend
rejects by design. Either have users reset their passwords, or run a one-off
script that decrypts with the old cipher and re-hashes with bcrypt.

Starting from an empty database avoids the problem entirely.

## Before going live

Revoke the credentials committed to the Java repository: the Gmail app
password in `ContactServiceImpl`, the JWT signing key in `JwtUtils`, and the
values in `application.yml`. They remain in that repository's history, so
deleting the lines is not enough.
