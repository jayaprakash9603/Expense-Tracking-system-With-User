# Demo mode HTTP adapter

Set `VITE_APP_RUNTIME_MODE=demo` in the app [`.env`](../../.env) (then restart dev or rebuild). [`handleDemoRequest.js`](handleDemoRequest.js) satisfies a subset of backend routes using data in `sessionStorage` under `expensio_demo_store_v1`. Each request uses the demo Axios adapter and an empty `baseURL`, so traffic does not go to the backend host.

Default demo credentials (overridable via `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`): **admin@gmail.com** / **admin**. Profile responses use **ADMIN** role and **ADMIN** `currentMode`.

## Covered areas

- Auth: signin, signup, Google OAuth stub, check-email, verify-login-otp
- User: profile GET/PUT, switch-mode, two-factor stub
- Settings: get/put/default/reset/exists
- Analytics overview and entity stub
- Expenses: list, paginated list, detail, CRUD, cashflow series, summary, top names, category/payment distributions
- Budgets: list, overview, CRUD
- Bills: list, upcoming, CRUD, mark paid
- Categories: CRUD
- Friends: list, suggestions, incoming requests
- Groups: minimal list/create stubs
- Notifications and notification-preferences stubs
- Reports path prefix stub

## Extending

Add matchers in `handleDemoRequest.js` (or split handlers) and persist via `saveDemoStore` from [`demoStore.js`](demoStore.js).
