# Expense Tracking Documentation

This `docs` space is the canonical documentation set for the project.

Legacy notes previously scattered in `readmefiles` have been consolidated into focused guides. Historical files remain traceable through the source map in [`docs/archive/source-map.md`](archive/source-map.md).

## Start Here

- Security baseline: [`docs/SECURITY.md`](SECURITY.md)
- Architecture overview: [`docs/architecture/overview.md`](architecture/overview.md)
- Event and data flows: [`docs/architecture/event-and-data-flows.md`](architecture/event-and-data-flows.md)
- Deployment and runbooks: [`docs/operations/deployment-and-runbooks.md`](operations/deployment-and-runbooks.md)

## Feature Guides

- Notifications
  - [`docs/features/notifications/overview.md`](features/notifications/overview.md)
  - [`docs/features/notifications/settings-and-preferences.md`](features/notifications/settings-and-preferences.md)
  - [`docs/features/notifications/testing-and-troubleshooting.md`](features/notifications/testing-and-troubleshooting.md)
- Budget, bills, and reports
  - [`docs/features/budget-bills-reports/overview.md`](features/budget-bills-reports/overview.md)
- Settings, theming, and shared UI
  - [`docs/features/settings-theme-ui/overview.md`](features/settings-theme-ui/overview.md)
- Friends
  - [`docs/features/friends/overview.md`](features/friends/overview.md)

## Backend and Reliability

- Backend service patterns: [`docs/backend-services/overview.md`](backend-services/overview.md)
- Performance and reliability fixes: [`docs/performance-reliability/optimization-and-fixes.md`](performance-reliability/optimization-and-fixes.md)

## Archive and Traceability

- Legacy readmefiles archive notes: [`docs/archive/readmefiles-legacy/README.md`](archive/readmefiles-legacy/README.md)
- Full source-to-canonical mapping: [`docs/archive/source-map.md`](archive/source-map.md)

## Consolidation Policy

1. Canonical docs are the source of truth.
2. Summary and quick-reference variants from legacy docs are merged into canonical sections.
3. Mermaid diagrams are used for architecture and process visuals.
4. Any new doc should be added under `docs/features`, `docs/architecture`, `docs/backend-services`, `docs/operations`, `docs/performance-reliability`, or `docs/archive` as appropriate.
