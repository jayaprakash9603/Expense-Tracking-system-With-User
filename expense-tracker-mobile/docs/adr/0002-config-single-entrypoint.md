# ADR 0002: Config Single Entrypoint

## Status

Accepted

## Context

Config values are spread across multiple files, which creates inconsistent import patterns.

## Decision

Use `src/config/index.js` as the primary import surface for app-wide configuration.

## Consequences

- Easier discovery of configuration values.
- Legacy direct config imports remain temporarily as compatibility re-exports.
