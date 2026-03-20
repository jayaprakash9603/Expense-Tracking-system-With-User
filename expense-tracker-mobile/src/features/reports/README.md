# reports Feature Boundary

## Scope
- Own UI flows and user interactions for the 'reports' feature.
- Keep business logic in src/domain/reports when applicable.

## Depends On
- @/shared/* for shared UI and utilities.
- @/redux/* for global state integration.
- @/infrastructure/* for API/websocket/storage adapters.

## Exposes
- Page-level routes registered in src/app/routing/routeCatalog.js.
- Reusable feature-level components/hooks through local index exports.

## Migration Notes
- Parity tracking source: docs/migration/PARITY_MATRIX.md.
- New UI must follow docs/architecture/UI-USAGE-RULES.md.
