# Nimbus — SaaS Admin Dashboard (boilerplate)

A full-stack boilerplate for admin dashboards: React + Vite + TypeScript on the
frontend, Node/Express + TypeScript + Prisma on the backend, JWT auth with rotating
refresh tokens, a complete "clients" CRUD, and an original visual identity (this is
not the generic gray-and-blue shadcn/Tailwind UI template).

## Demo

**Live demo:** [https://nimbus-saas-admin.netlify.app](https://nimbus-saas-admin.netlify.app)

Login credentials:
- **Email:** `demo@saasadmin.dev`
- **Password:** `Demo@1234`

> ⚠️ **Shared demo environment.** Everyone who opens the link sees and edits the
> same data. Don't put anything sensitive in there — records may be reset
> periodically without notice.

## Stack

| Layer      | Technologies |
|------------|-------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form + Zod, Axios |
| Backend    | Node.js, Express, TypeScript, Zod |
| Database   | PostgreSQL via Prisma ORM — production running on [Neon](https://neon.tech) |
| Auth       | JWT access token (15 min) + rotating refresh token in an httpOnly cookie (7 days) |

## Project structure

```
saas-admin/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # User, RefreshToken, Client models
│   │   └── seed.ts            # seeds the database with fake data
│   └── src/
│       ├── config/            # env, prisma client singleton
│       ├── middleware/        # auth, error handler
│       ├── modules/
│       │   ├── auth/          # schema, service, controller, routes
│       │   └── clients/       # schema, service, controller, routes (CRUD)
│       ├── utils/             # JWT tokens, ApiError, asyncHandler
│       ├── app.ts
│       └── server.ts
└── frontend/
    └── src/
        ├── app/                # App.tsx, protected/public routes
        ├── components/
        │   ├── ui/             # Button, Input, Select, Card, Modal, StatusBadge...
        │   └── layout/         # Sidebar, Topbar, DashboardLayout
        ├── features/
        │   ├── auth/           # Login, Register, AuthContext
        │   ├── clients/        # table, form modal, API
        │   └── dashboard/      # overview, metrics, theme
        ├── hooks/              # useClients, useClientMetrics
        └── lib/                # axios instance with automatic refresh, format, cn
```

Organized by *feature*, not by loose file type — each domain (auth, clients,
dashboard) owns its own validation schema, API calls, and components.

## Prerequisites

- Node.js 18+
- npm 9+
- A reachable PostgreSQL instance for local development — a Docker container
  (`docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`) or a free
  database on a managed provider like [Neon](https://neon.tech) or
  [Supabase](https://supabase.com) both work fine. There's no zero-config
  SQLite mode in this project anymore.

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and point DATABASE_URL at your PostgreSQL instance
npm install

# Generates the Prisma client from the schema
npm run prisma:generate

# Applies the existing migrations to the Postgres database in DATABASE_URL
npm run prisma:deploy

# Seeds 1 demo user + 40 fake clients
npm run seed

# Starts the API at http://localhost:4000
npm run dev
```

> **Important:** always run `npm install` before any Prisma command, and use
> the `package.json` scripts (`npm run prisma:generate`,
> `npm run prisma:deploy`) instead of typing `npx prisma ...` directly. If you
> run `npx prisma generate` **before** `npm install` (or in a directory with
> no `node_modules`), `npx` can't find a local binary, ignores the version
> pinned in `package.json`, and pulls the latest Prisma release straight from
> the registry — which can be a different major version (e.g. Prisma 7, which
> breaks the `datasource.url` format used in this schema with error `P1012`,
> regardless of whether the provider is SQLite or Postgres). If that happens,
> the symptom is `npx` itself asking `Need to install the following packages: prisma@X`
> — that's the tell that `npm install` was skipped. The fix is: run
> `npm install` and stick to the `npm run` scripts, not raw `npx`.

Demo login created by the seed:
- **Email:** `demo@saasadmin.dev`
- **Password:** `Demo@1234`

### 2. Frontend

In another terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**.

## Useful scripts (backend)

| Command | Description |
|---|---|
| `npm run dev` | Starts the API with hot reload (tsx watch) |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled build |
| `npm run prisma:migrate` | **Schema development only**: creates a new migration from changes to `schema.prisma` |
| `npm run prisma:deploy` | **For anyone cloning the project**: applies the migrations that already exist in `prisma/migrations`, without creating any new ones — this is the right command to set up the database for the first time |
| `npm run prisma:studio` | Opens Prisma Studio (database GUI) |
| `npm run seed` | Resets and re-seeds the database with fake data |

## Useful scripts (frontend)

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server |
| `npm run build` | Typecheck + production build in `dist/` |
| `npm run preview` | Serves the production build locally |

## Deploy

**Backend** — works on any platform that runs a persistent Node.js process
with Postgres (e.g. **Render**, **Railway**): build with `npm run build`,
start with `npm start` (runs `dist/server.js`). Run `npm run prisma:deploy` as
a build/release step against the production database before rolling out a new
version — **never** `npm run prisma:migrate` in production, that's the
development command and it tries to create a new migration on every run.

Required environment variables on the backend (see `.env.example`):
- `PORT`
- `NODE_ENV`
- `CORS_ORIGIN` — your production frontend origin(s), not `localhost`
- `DATABASE_URL` — Postgres connection string
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `REFRESH_COOKIE_NAME`

**Frontend** — static build, works on **Netlify**, **Vercel**, or any static
file host: `npm run build` outputs `dist/`, serve that folder directly
(configure an SPA fallback to `index.html` for all routes, since routing is
client-side via React Router).

Required environment variable on the frontend (see `.env.example`):
- `VITE_API_URL` — your production backend's public URL

## Security

- **Per-user scoping**: every `Client` record stores `createdById`, the id of
  the user who owns it. All five service operations
  (`listClients`, `getClientMetrics`, `getClientById`, `updateClient`,
  `deleteClient`) take the authenticated user's `userId` (pulled from the
  access token by the `requireAuth` middleware, never from the request
  body/query) and filter **every** Prisma query by `createdById: userId`.
- **No existence leaks**: if a client id exists but belongs to a different
  user, the API responds `404 Not Found` — the same status as "doesn't
  exist." Never `403 Forbidden`, which would confirm the record exists
  somewhere in another account.
- Every route under `/api/clients` goes through `requireAuth` before any
  handler runs (`clientsRouter.use(requireAuth)`), no exceptions.
- In practice, this means **two registered users never share client data**
  with each other, even if one knows the exact `id` of a record belonging to
  the other.

**Out of scope for this fix, worth knowing if you extend the boilerplate:**
- The refresh token is validated by `jti` (a unique id signed into the JWT)
  without a redundant check against `userId` — not exploitable today, but an
  easy extra layer of defense to add.

## Rate limiting

`POST /api/auth/login`, `POST /api/auth/register`, and `POST /api/auth/refresh`
all go through `createAuthRateLimiter()` (`middleware/rateLimit.ts`): **5
requests per IP every 15 minutes**, per route. Each route calls the factory
separately, so the counters are independent of each other — 5 failed attempts
on `/login` don't eat into the limit for `/register` or `/refresh` (and vice
versa). Once exceeded, the API responds `429 Too Many Requests` with
`{"message": "Too many attempts. Please wait 15 minutes before trying
again."}`.

`/logout` and `/me` are excluded — they're not brute-force vectors.

> **Known limitation**: the counter lives in the Node process's memory. This
> works for a single backend instance. If you scale horizontally (multiple
> instances behind a load balancer), each instance gets its own counter — for
> multi-instance production, use a shared store (e.g. `rate-limit-redis`).

## CSRF

The refresh token lives in an `httpOnly` cookie, which protects it from being
read by malicious JavaScript (XSS) — but cookies are sent automatically by the
browser on any request to the domain, including ones a malicious site triggers
without the user noticing (CSRF). Two independent layers protect the routes
that read this cookie (`/api/auth/refresh` and `/api/auth/logout`):

1. **`SameSite=Strict` cookie** (`auth.controller.ts`): the browser only
   attaches the cookie to requests that are already same-site. Since refresh
   is always called via `fetch` from inside the already-loaded SPA — never via
   a top-level navigation coming from another site — `Strict` doesn't break
   any real flow here, and it's more restrictive than `Lax`.
2. **Required custom header** (`middleware/csrf.ts`, applied to `/refresh` and
   `/logout`): covers older browsers that never implemented `SameSite`. A
   `<form>` submit or a `no-cors` fetch triggered by an attacker's site can't
   attach a custom header — only "simple" requests (no extra headers) skip the
   CORS preflight. By requiring `X-Nimbus-CSRF: 1`, any request that tries to
   include that header becomes a "non-simple" request, which triggers a CORS
   preflight checked against the origin allowlist in `app.ts` — the
   attacker's origin isn't on it, so the browser blocks the real request
   before it's ever sent.

The frontend (`src/lib/api.ts`) already sends this header on every request via
the Axios instance; no extra work is needed to consume the API from this
boilerplate's frontend. A third-party client (Postman, `curl`, a native mobile
app) will also need to send this header manually to call `/refresh` or
`/logout` — that's intentional: the header isn't a secret, it exists to tell
"a legitimate app request" apart from "a request a browser fires on behalf of
a malicious site," not to authenticate who's calling.

### How to test it

With the backend running at `http://localhost:4000` and you already logged in
(so you have a valid refresh cookie in your browser or saved in your API
client):

**1. Confirm the header is required (simulating a different origin/client):**

```bash
# Without the custom header -> should return 403
curl -i -X POST http://localhost:4000/api/auth/refresh \
  --cookie "saas_admin_rt=<paste the cookie value here>"
```
Expected response: `403 Forbidden` with
`{"message":"Request blocked by CSRF protection (missing or invalid header)"}`.

```bash
# With the custom header -> should work normally
curl -i -X POST http://localhost:4000/api/auth/refresh \
  --cookie "saas_admin_rt=<paste the cookie value here>" \
  -H "X-Nimbus-CSRF: 1"
```
Expected response: `200 OK` with a new `accessToken`.

**2. Confirm a different origin is rejected even with the header present:**

```bash
curl -i -X POST http://localhost:4000/api/auth/refresh \
  --cookie "saas_admin_rt=<paste the cookie value here>" \
  -H "X-Nimbus-CSRF: 1" \
  -H "Origin: http://malicious-site.com"
```
This tests the CORS layer, not the header itself — `curl` ignores CORS (it's
a browser-enforced protection, not part of the HTTP protocol), so this
specific call will still return `200`. What this request actually proves is
that the real cross-origin defense happens in the browser: repeat the same
test from the DevTools console of a tab open on `http://malicious-site.com`
(or any origin outside `CORS_ORIGIN` in your `.env`), running:
```js
fetch("http://localhost:4000/api/auth/refresh", {
  method: "POST",
  credentials: "include",
  headers: { "X-Nimbus-CSRF": "1" },
});
```
Expected result in the console: a CORS error (`blocked by CORS policy`) — the
request never even reaches the server, because the preflight gets rejected
since the origin isn't on the allowlist.

**3. Confirm `SameSite=Strict` is actually set on the cookie:**

In DevTools → Application → Cookies → `http://localhost:4000`, the
`saas_admin_rt` cookie should show `SameSite: Strict` in the corresponding
column. If it shows `Lax` or is blank, the change wasn't applied / the server
hasn't been restarted.

**4. Confirm the app's legitimate flow still works end to end:**

Log in normally, let the access token expire (or force it by temporarily
setting `JWT_ACCESS_EXPIRES_IN` to something like `10s` in `.env`), and
confirm the app keeps working without prompting for another login — the Axios
interceptor should transparently renew the token via `/refresh`, already
sending the header automatically.

## Authentication

- **Access token**: short-lived JWT (15 min), kept in memory on the frontend
  (never in `localStorage`), sent via the `Authorization: Bearer` header.
- **Refresh token**: `httpOnly` + `sameSite=strict` cookie, 7-day lifetime,
  rotated on every use (the old token is revoked in the database). This
  limits the blast radius if a token ever leaks, since each refresh token can
  only be used once. See the [CSRF](#csrf) section for why `Strict` instead of
  `Lax`.
- An Axios interceptor detects `401` responses, calls `/api/auth/refresh`
  automatically, and retries the original request — no forced re-login as long
  as the session is still valid.
- Backend routes under `/api/clients` go through a `requireAuth` middleware
  that validates the access token.

## Features

- [x] Login / registration with email and strong-password validation (8+
      characters, uppercase, lowercase, number, and symbol)
- [x] Dashboard with a collapsible sidebar (desktop) and a drawer (mobile)
- [x] Client CRUD: name, status (lead/active/paused/churned), value, creation
      date
- [x] Table with pagination, name search, and column sorting (click any
      header)
- [x] Create/edit modal with validation via Zod + React Hook Form
- [x] Metric cards: total records, active clients, growth this month
      (compared to the previous month)
- [x] Light/dark theme with persistence in `localStorage`
- [x] Responsive layout (sidebar becomes a drawer on small screens)
- [x] Seed with 40 plausible fake records via `@faker-js/faker` (mixed
      company and person names, dates spread across the last 6 months, status
      in a 40/25/20/15% quota)

## Design

An original color palette, built to avoid the generic "gray + blue" look of
most templates:

- **Primary**: deep petrol blue (`#0F4C5C`) — trustworthy, serious about data
- **Accent**: electric lime green (`#C4F135`) — used sparingly for highlights,
  positive metrics, and the logo
- **Neutrals**: warm near-black (`#14181B`) and warm off-white (`#F7F5F0`),
  instead of plain gray

Typography: **Fraunces** (serif, characterful) for headings and the
wordmark, **Inter** for interface text, **JetBrains Mono** for numbers and
tabular data — a clear split between "editorial content" and "data."

Micro-interactions: 150–200ms transitions on hover states, visible focus rings
on every interactive element, table row actions (edit/delete) appear on hover.

## License

After purchase, you're granted:
- **Unlimited** personal or commercial use — in as many projects as you want,
  yours or your clients', with no cap on the number of applications built
  from this code.
- The right to modify the code freely to fit your project.

Not permitted:
- Reselling, redistributing, or sublicensing the **source code of this
  boilerplate itself** as a competing product (e.g. republishing it on
  Gumroad, on another template marketplace, or as a "new" boilerplate with
  minor tweaks). Building and selling an application *made with* this code is
  fine; reselling the template itself is not.

No warranty: the code is provided "as is," with no guarantee of correctness,
security, or fitness for any particular purpose. Use it at your own risk —
review, test, and audit it before putting it into production with real data.
