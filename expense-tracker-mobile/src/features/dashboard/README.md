# dashboard Feature Boundary

## Scope
- Own UI flows and user interactions for the 'dashboard' feature.
- Keep business logic in src/domain/dashboard when applicable.

## Depends On
- @/shared/* for shared UI and utilities.
- @/redux/* for global state integration.
- @/infrastructure/* for API/websocket/storage adapters.

## Exposes
- Page-level routes registered in src/app/routing/routeCatalog.js.
- Dashboard UI under [`components/`](components/) (`header`, `quick-access`, `sections`, `charts`, `modals`) and hooks/context alongside.

## Migration Notes
- Parity tracking source: docs/migration/PARITY_MATRIX.md.
- New UI must follow docs/architecture/UI-USAGE-RULES.md.
