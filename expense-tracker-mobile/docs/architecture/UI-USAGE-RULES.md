# UI Usage Rules

These rules make design consistency automatic for future features.

## Required UI Composition

- Prefer `shared/components/*` wrappers for app-level UI.
- Use `components/ui/*` for shadcn primitives only.
- New feature pages should compose from wrappers/templates, not raw utility-heavy JSX blocks.

## Styling Rules

- Prefer semantic token usage via config and theme variables.
- Avoid hardcoded one-off colors in feature files.
- Keep responsive behavior mobile-first.

## States

- Every list/form page must handle:
  - loading
  - empty
  - error
  - success

## Modals and Drawers

- Use consistent trigger/content patterns and close behavior.
- Avoid custom modal implementations unless a shared primitive does not satisfy behavior.

## SRP Enforcement

- Keep page components focused on orchestration only.
- Keep rendering primitives in shared components and business logic in domain/services.
- Avoid mixing API calls, complex transformation logic, and JSX presentation in the same file.
