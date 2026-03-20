# Coding Contracts

Phase 0 contract for all new or modified files.

## Language and Type Safety

- Project remains JavaScript in this phase.
- Add JSDoc contracts for:
  - shared component props
  - domain entity payloads
  - service function signatures
  - selector return shapes

## Naming

- Components: `PascalCase`.
- Hooks: `useXxx`.
- Constants: `UPPER_SNAKE_CASE`.
- Route keys: kebab-case and stable.

## File Structure

- Feature code must stay inside `src/features/<feature>`.
- Business rules go to `src/domain/<feature>`.
- API/network code goes to `src/infrastructure/api` or `src/infrastructure/*`.
- Do not place business logic in pages/components.

## State and Async

- Async behavior must be represented with standard states from `shared/standards/asyncStates.js`.
- Redux actions should delegate domain logic to services/transformers.
