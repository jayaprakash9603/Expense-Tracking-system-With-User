# Test Suites Module

This module packages reusable suite resources for local, CI, and Kubernetes execution.

## Structure

- `features/<domain>/...` domain-oriented feature files
- `features/templates/...` reusable pattern scenarios (`@template`)
- `testdata/request-templates/<domain>/...` payload examples for endpoint-key DSL
- `testdata/expected-fragments/<domain>/...` reusable assertion fragments
- `config/suite-data*.properties` suite aliases consumed by `${suite.*}`
- `config/datatable-templates.md` key/value DataTable authoring conventions

## Authoring Model

1. Use endpoint keys (for example `expenses.create`) instead of raw URLs.
2. Prefer generic steps:
   - `client sends <METHOD> request to endpoint "<key>"`
   - `client sends <METHOD> request to endpoint "<key>" with data`
3. Use DataTable `key | value` form with prefixes:
   - `path.<name>`, `query.<name>`, `header.<name>`, `<payloadField>`
4. Use runtime interpolation:
   - `${ctx.<alias>}`, `${suite.<key>}`, `${random.*}`, `${now...}`

`@template` scenarios are intentionally skipped at runtime and serve as reusable authoring references.
