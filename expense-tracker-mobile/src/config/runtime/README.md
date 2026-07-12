# Runtime configuration

## Feature flags

Source of truth: `feature-matrix.yaml` (versioned `defaults`, then `profiles.live` / `profiles.demo`). Nested YAML objects are flattened to dotted keys (for example `settings.section.appearance`).

### Merge order (later wins)

1. `defaults` from `feature-matrix.yaml`
2. `profiles[runtimeMode]` where `runtimeMode` is `live` or `demo` from `VITE_APP_RUNTIME_MODE`
3. `VITE_FEATURE_FLAGS_JSON` (JSON object) for ops or CI overrides

`getAppConfig().featureFlags` is the merged, frozen result. `isFeatureEnabled(key)` and `useFeatureFlag(key)` return `false` if the key is missing or falsy.

### Environment variables

Vite reads **`.env`** only (not `.env.example`). If `.env` is missing, the first dev/build copies `.env.example` → `.env` via `vite.config.js`. Edit `.env`, set `VITE_APP_RUNTIME_MODE` to `live` or `demo`, then **restart** `bun run dev` (or rebuild). `.env` is gitignored.

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_APP_RUNTIME_MODE` | `live` or `demo` (invalid values fall back to `demo`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client id (empty disables OAuth UI flows that require it) |
| `VITE_DEMO_SEED_SCENARIO` | `empty` or `sample` for demo fixture seeding |
| `VITE_DEMO_EMAIL` | Demo login email |
| `VITE_DEMO_PASSWORD` | Demo login password |
| `VITE_FEATURE_FLAGS_JSON` | Optional JSON object merged on top of the YAML profile |

### Route key → feature flag

Sidebar (`getSidebarItems`): `routeCatalog` `key` → flag (only routes with an entry are gated).

| Route key | Flag |
|-----------|------|
| `groups` | `groups` |
| `friends` | `friends` |
| `bills` | `bills` |
| `budgets` | `budgets` |
| `notifications` | `notifications` |
| `utilities` | `utilities` |
| `categories` | `sidebarCategories` |
| `payments` | `sidebarPayments` |
| `analytics` | `sidebarInsights` |
| `reports` | `sidebarInsights` |

Bottom navigation (`getBottomNavItems`):

| Route key | Flag |
|-----------|------|
| `reports` | `sidebarInsights` |
| `friends` | `friends` |
| `bills` | `bills` |
| `groups` | `groups` |

More menu (`getMoreMenuItems`):

| Route key | Flag |
|-----------|------|
| `categories` | `sidebarCategories` |
| `payments` | `sidebarPayments` |
| `notifications` | `notifications` |
| `groups` | `groups` |

Routes not listed above are not filtered by these maps.

### Adding a flag

1. Add the key under `defaults` in `feature-matrix.yaml` (and adjust `profiles.demo` / `profiles.live` if needed).
2. Use `isFeatureEnabled("your.key")`, `useFeatureFlag("your.key")`, or `<FeatureGate flagKey="your.key">` in UI.
3. Document new route mappings here if you extend `SIDEBAR_ROUTE_FEATURE`, `BOTTOM_NAV_ROUTE_FEATURE`, or `MORE_MENU_ROUTE_FEATURE` in `src/app/routing/routeCatalog.js`.
