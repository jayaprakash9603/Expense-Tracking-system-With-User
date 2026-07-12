# Demo mode HTTP adapter

Set `VITE_APP_RUNTIME_MODE=demo` in your local **`.env`** (copy from [`.env.example`](../../.env.example)), then restart dev or rebuild. [`runtime/handleDemoRequest.js`](runtime/handleDemoRequest.js) resolves requests with store-backed handlers first, then the **Postman route manifest** (heuristic stubs and optional JSON overrides). Session entities live in `sessionStorage` under `expensio_demo_store_v1`. The Axios adapter uses an empty `baseURL` in demo mode.

Default demo credentials (overridable via `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD`): **admin@gmail.com** / **admin**. Profile responses use **ADMIN** role and **ADMIN** `currentMode`.

## Layout

| Folder | Role |
| ------ | ---- |
| [`runtime/`](runtime/) | Request orchestration (`handleDemoRequest`) |
| [`store/`](store/) | Session store, seed loading |
| [`domain/`](domain/) | Budget math, analytics, cashflow, profile builders |
| [`http/`](http/) | Request parsing and demo HTTP helpers |
| [`postman/`](postman/) | Manifest stub matching, path templates |
| [`seed/`](seed/) | Relative-date hydration for fixtures |
| [`handlers/`](handlers/) | Store-backed route handlers |
| [`fixtures/`](fixtures/) | Seed JSON, overrides, optional Excel |
| [`generated/`](generated/) | Postman manifest JSON |

## Postman manifest and stubs

- Generated file: [`generated/postmanRoutes.manifest.json`](generated/postmanRoutes.manifest.json) (**555** unique `METHOD` + `pathTemplate` rows from [`expense-tracking-backend/postman-collection.json`](../../../../expense-tracking-backend/postman-collection.json)).
- Regenerate after Postman edits: `bun run extract:postman` (runs [`scripts/extractPostmanRoutes.mjs`](../../../scripts/extractPostmanRoutes.mjs)).
- Fallback stubs: [`postman/postmanManifestStub.js`](postman/postmanManifestStub.js) (method/path heuristics, longest path match first).
- Optional response overrides: [`fixtures/overrides/*.json`](fixtures/overrides) — filename = sanitized manifest `id` (see [`fixtures/README.md`](fixtures/README.md)).

## Seed data and dates

- Initial store: [`fixtures/seed.entities.json`](fixtures/seed.entities.json), hydrated with [`seed/hydrateRelativeDates.js`](seed/hydrateRelativeDates.js) via [`store/loadDemoSeedFromFixtures.js`](store/loadDemoSeedFromFixtures.js) so **dates track the current local calendar day**.
- Excel source (optional): [`fixtures/Demo_Data.xlsx`](fixtures/Demo_Data.xlsx). Regenerate JSON from the workbook with `bun run demo:seed:from-xlsx`. Recreate workbook + JSON from built-in generators with `bun run demo:seed:write-xlsx` (see [`scripts/excelToDemoSeed.mjs`](../../../scripts/excelToDemoSeed.mjs) and [`fixtures/README.md`](fixtures/README.md)).

## Handlers

Domain logic lives under [`handlers/`](handlers/) (auth, user, settings, analytics, expenses, budgets, bills, categories, friends/notifications/misc). Extend there for store-backed behavior; use manifest overrides for read-only API shapes.

## Covered areas (store + stubs)

- Auth, user profile, settings, analytics overview/entity
- Expenses, budgets, bills (including GET bill by id), categories
- Friends, notifications, reports, payment-methods, groups
- All other Postman-listed routes: default stub payloads unless overridden
