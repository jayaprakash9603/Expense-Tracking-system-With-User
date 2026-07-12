# ADR 0001: Layer Boundaries

## Status

Accepted

## Context

The app is growing with migration from a legacy frontend. Without strict boundaries, business logic leaks into UI and feature coupling increases.

## Decision

Adopt directional imports across layers as defined in `docs/architecture/BOUNDARIES.md` and enforce them with lint and architecture validation script.

## Consequences

- Better maintainability and easier onboarding.
- Slight up-front discipline cost when adding files.
