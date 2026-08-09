# Frontend Architecture — Ports & Adapters

This document describes the hexagonal (ports & adapters) layout introduced in `expense-tracking-frontend`.

## Layer diagram

```
UI (features/*/pages, hooks)  →  Use-cases (pure JS)  →  Ports (contracts)
                                                              ↑
Composition root (platform/container) binds adapters by config
                                                              ↓
Adapters: axios (live) | snow simulator | mock | STOMP | localStorage
```

**Rule:** dependencies point inward. `usecases/` must never import React, axios, or Redux.

## Folder map

| Path | Role |
|------|------|
| `src/platform/` | Composition root, HTTP/realtime/storage/auth ports & adapters, appConfig |
| `src/api/endpoints/` | Generated + override endpoint catalog |
| `src/features/<name>/ports/` | Feature contracts (JSDoc typedefs) |
| `src/features/<name>/adapters/` | HTTP / mock implementations of ports |
| `src/features/<name>/usecases/` | Pure business operations |
| `src/components/ui/` | Design-system primitives (prefer these over raw MUI) |
| `src/shared/theme/tokens.js` | Spacing, radius, typography, elevation, semantic colors |

## How to switch to the snow simulator

### Option A — env (build time)

```bash
REACT_APP_TRANSPORT=snow
REACT_APP_SNOW_BASE_URL=http://localhost:8089
```

### Option B — runtime (no rebuild)

Edit `public/runtime-config.js` on the deployed host:

```js
window.__APP_CONFIG__ = {
  transport: "snow",
  snowBaseUrl: "https://snow.example.com",
};
```

Precedence: `window.__APP_CONFIG__` > `REACT_APP_*` > defaults.

Other values: `transport: "live"` | `"mock"`.

Per-service routing:

```js
window.__APP_CONFIG__ = {
  transport: "live",
  serviceBaseUrls: { expense: "http://localhost:6001", bill: "http://localhost:6002" },
};
```

## How to add an endpoint

1. Prefer adding it to the Automation YAML under  
   `Automation/test-suites/src/main/resources/config/endpoints/<service>/`.
2. Regenerate the frontend catalog:

```bash
cd expense-tracking-frontend
npm run generate:endpoints
```

3. For SPA-only paths (not in Automation), add to  
   `src/api/endpoints/overrides.js` → `FRONTEND_ONLY_ENDPOINTS`.
4. Call via catalog key:

```js
await http.request({
  endpointId: "expenses.list",
  query: { sortOrder: "desc" },
});
```

## How to add a feature (hexagonal)

```
features/my-feature/
  ports/myRepository.port.js
  adapters/myHttpRepository.js
  adapters/myMockRepository.js
  adapters/index.js          # registerMyRepository(container)
  usecases/
  hooks/
  pages/
  components/
  index.js                   # public barrel — ONLY entry point
```

1. Define the port (methods only).
2. Implement HTTP adapter with `endpointId` keys from the catalog.
3. Implement mock adapter for tests.
4. Register in `src/platform/bootstrap.js`.
5. Keep Redux thunks thin: dispatch → use-case(repo) → success/failure.
6. Export only through `index.js`.

## Design system

- Import primitives from `components/ui` (alias `@ui`).
- Colors: `useTheme().colors` or CSS vars `--color-*`.
- Spacing/radius/typography: `shared/theme/tokens.js`.
- Semantic colors: use `SEMANTIC` from tokens (canonical `#ef4444` error / `#22c55e` success) — do not introduce `#ff4d4f` / `#4caf50`.
- Prefer Tailwind `theme-*` utilities over `bg-[#hex]`.

## Import aliases

| Alias | Path |
|-------|------|
| `@/` | `src/` |
| `@platform` | `src/platform` |
| `@api` | `src/api` |
| `@features` | `src/features` |
| `@shared` | `src/shared` |
| `@ui` | `src/components/ui` |
| `@hooks` | `src/hooks` |
| `@utils` | `src/utils` |
| `@redux` | `src/Redux` |

## Import rules (ESLint)

- No direct `axios` outside `src/platform/http/**` (error in migrated features).
- Use-cases cannot import `react`, `react-redux`, or `axios`.
- Cross-feature imports only via the target feature's `index.js` barrel.

## Pilot features

`expenses` and `bills` are the reference migrations:

- Repositories registered at boot via `platform/bootstrap.js`.
- `getExpensesAction` / `createExpenseAction` / `fetchBills` call use-cases + repositories.
- `BillReport` lives under `features/reports` (not re-exported from bills).

## Regenerating the endpoint catalog

```bash
npm run generate:endpoints
```

Source of truth: Automation YAML files (256+ endpoints across 16 services).
