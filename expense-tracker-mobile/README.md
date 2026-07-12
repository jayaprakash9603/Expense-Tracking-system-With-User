# Expense Tracker Mobile

Vite + React client. Env vars are documented in [`.env.example`](.env.example). **Vite only reads `.env`**, not `.env.example`. On first `bun run dev` / `bun run build`, if `.env` is missing, [`vite.config.js`](vite.config.js) copies `.env.example` → `.env`. Edit **`.env`** for `VITE_APP_RUNTIME_MODE` (`demo` | `live`), then restart the dev server so Vite picks up changes.

## Switching demo ↔ live

1. Ensure you have a **`.env`** (from `.env.example`), then edit it (see table below). The main switch is **`VITE_APP_RUNTIME_MODE`** (`demo` or `live`).
2. Restart the dev server (`bun run dev`) or run a fresh **`bun run build`**. Vite inlines `VITE_*` at compile time, so a reload without restart does not pick up `.env` changes.

No other config files or code changes are required for mode switching.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_APP_RUNTIME_MODE` | `demo` (default in code if unset): in-browser mock API + sessionStorage. `live`: real HTTP to `VITE_API_BASE_URL`. |
| `VITE_API_BASE_URL` | Backend origin for **live** only (ignored for network calls in demo). |
| `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD` | Demo sign-in when mode is `demo` (defaults: `admin@gmail.com` / `admin`). |
| `VITE_DEMO_SEED_SCENARIO` | `sample` or `empty` for first demo session. |
| `VITE_FEATURE_FLAGS_JSON` | JSON object merged over [`feature-matrix.yaml`](src/config/runtime/feature-matrix.yaml) for the active runtime mode. |
| `VITE_GOOGLE_CLIENT_ID` | Google Sign-In for **live** when feature flag `googleOAuth` is true. |

## Demo login

When `VITE_APP_RUNTIME_MODE=demo`, sign in with `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`. Profile is **ADMIN** / **ADMIN** mode. Data stays in **sessionStorage** until the session ends.

Demo seed JSON, date hydration, and Postman-aligned route stubs: [`src/infrastructure/demo/README.md`](src/infrastructure/demo/README.md). After updating the backend Postman collection, run **`bun run extract:postman`** in this folder to refresh [`src/infrastructure/demo/generated/postmanRoutes.manifest.json`](src/infrastructure/demo/generated/postmanRoutes.manifest.json).

## Docker

Default image build is **demo**:

```bash
docker build -t expensio-mobile:demo ./expense-tracker-mobile
```

**Live** image:

```bash
docker build -t expensio-mobile:live \
  --build-arg VITE_APP_RUNTIME_MODE=live \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  ./expense-tracker-mobile
```

Run:

```bash
docker run -p 8080:80 expensio-mobile:demo
```

## Demo API coverage

See [`src/infrastructure/demo/README.md`](src/infrastructure/demo/README.md).
