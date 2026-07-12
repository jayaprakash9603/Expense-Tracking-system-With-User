# Shared Screen Templates (Phase 0 Contract)

This folder defines required page archetypes for upcoming phases.

## Planned templates

- `ListScreen`: Standard list layout with filters, sorting, pagination, and unified async states.
- `DetailScreen`: Entity detail layout with actions and related sections.
- `FormScreen`: Entity create/edit layout with validation and submission states.
- `ReportScreen`: Report layout with controls, preview, export actions, and empty/error states.

## Contract

- New feature pages should use template composition once templates are introduced.
- Async states must use `shared/standards/asyncStates.js`.
- Avoid one-off page shells in feature folders after template rollout.
