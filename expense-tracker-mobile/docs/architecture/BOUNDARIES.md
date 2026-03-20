# Layer Boundaries

This document defines allowed dependency directions in `src/`.

## Layers

- `app`: app startup, route registration, providers, guards.
- `features`: user-facing screens and feature-level hooks/components.
- `domain`: business entities, validation, transformers, orchestration services.
- `infrastructure`: API clients, storage/network adapters, websocket adapters.
- `shared`: framework-agnostic primitives (UI wrappers, hooks, utils, contracts).
- `components/ui`: shadcn-level UI primitives.
- `layouts`: app shell composition.
- `redux`: global state orchestration.

## Allowed Imports

- `app` -> `features`, `layouts`, `shared`, `redux`, `config`.
- `features` -> `domain`, `shared`, `redux`, `infrastructure`, `config`, `components/ui`.
- `domain` -> `shared`, `infrastructure`, `config`.
- `infrastructure` -> `shared`, `config`.
- `redux` -> `domain`, `infrastructure`, `shared`, `config`.
- `layouts` -> `shared`, `redux`, `config`, `components/ui`.
- `shared` -> `config`, `components/ui`.

## Forbidden Imports

- `domain` must not import from `features`, `app`, or `layouts`.
- `infrastructure` must not import from `features`, `app`, `layouts`, or `redux`.
- `shared` must not import from `features`, `domain`, `app`, `layouts`, or `redux`.
- `components/ui` must remain presentational and must not import from `features`, `domain`, or `redux`.

## Import Path Rules

- Use alias imports: `@/feature/...` instead of deep relative imports.
- Do not import from another feature's internal file paths; expose via feature-level `index.js` when sharing is required.
- New cross-layer shared constants must go through `src/config/index.js`.
