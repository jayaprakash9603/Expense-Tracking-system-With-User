# ADR 0003: JSDoc Contract-First (Pre-TypeScript)

## Status

Accepted

## Context

The project stays in JavaScript for now but needs stronger contracts for maintainability.

## Decision

Adopt JSDoc contract-first for all new shared components, domain services, and state selectors until TypeScript migration is scheduled.

## Consequences

- Better autocomplete, safer refactoring, and clearer payload contracts.
- Minor overhead when adding new files because typedefs must be maintained.
