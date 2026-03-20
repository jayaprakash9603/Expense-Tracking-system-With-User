# Folder Ownership Matrix

Phase 0 requires each bounded context to have explicit ownership.

## Core Ownership

- `src/app`: Platform team (routing, providers, bootstrapping)
- `src/layouts`: Platform team (shell/navigation)
- `src/components/ui`: Design system maintainers
- `src/shared`: Platform + design system maintainers
- `src/config`: Platform maintainers
- `src/infrastructure`: Platform + API integration maintainers
- `src/domain`: Domain maintainers (business rules)
- `src/redux`: State management maintainers

## Feature Ownership

- `src/features/analytics`: Analytics team
- `src/features/auth`: Auth team
- `src/features/bills`: Billing team
- `src/features/budgets`: Budget team
- `src/features/categories`: Category team
- `src/features/dashboard`: Dashboard team
- `src/features/expenses`: Expense team
- `src/features/notifications`: Notification team
- `src/features/payment-methods`: Payment team
- `src/features/profile`: Profile team
- `src/features/reports`: Reporting team
- `src/features/settings`: Settings team
- `src/features/system`: Platform/system team

## Ownership Rules

- Every new route key must map to an owner in `src/app/routing/routeOwnership.js`.
- Cross-feature imports should go through explicit exports, not deep internal paths.
- Shared primitives and templates require review from platform/design maintainers.
- Domain-level business rules must be implemented in `src/domain/*` before wiring UI flows.
