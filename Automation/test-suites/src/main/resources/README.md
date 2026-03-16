# Test Suites Module

This module packages reusable suite resources for local, CI, and Kubernetes execution.

## Structure

```
test-suites/src/main/resources/
├── config/
│   ├── endpoints/<service>/<domain>.yaml   ← endpoint catalog
│   ├── suite-data*.properties              ← suite aliases for ${suite.*}
│   └── datatable-templates.md
├── schemas/<service>/<domain>/             ← response JSON schemas
├── payloads/<service>/<domain>/            ← request body templates
├── features/
│   ├── api/<service>/<domain>/*.feature    ← API feature files
│   ├── api/templates/                      ← copy-paste starters
│   └── ui/<domain>/*.feature               ← UI feature files
└── testdata/                               ← legacy fixtures
```

## Authoring Model

1. Register the endpoint in `config/endpoints/<service>/<domain>.yaml`.
2. Add response schema in `schemas/<service>/<domain>/<name>.schema.json`.
3. (Optional) Add request payload in `payloads/<service>/<domain>/<name>.json`.
4. Copy a template from `features/api/templates/` and replace placeholders.
5. Run with `mvn test -pl test-suites -Dcucumber.filter.tags="@smoke and @api"`.

Use generic steps:
- `When the user sends a <METHOD> request to "<endpoint-key>"`
- `When the user sends a <METHOD> request to "<endpoint-key>" with data`
- DataTable `key | value` with prefixes: `path.<name>`, `query.<name>`, `header.<name>`, `<payloadField>`
- Runtime interpolation: `${ctx.<alias>}`, `${suite.<key>}`, `${random.*}`, `${now...}`

`@template` scenarios are intentionally skipped at runtime and serve as authoring references.

## Running Suites

```bash
# All API smoke tests
mvn test -pl test-suites -Dcucumber.filter.tags="@smoke and @api"

# User API scenarios only
mvn -pl automation-app -am exec:java -Dexec.args="--run-only --runner=spring --suite=api --tags=@user-api"

# Validate catalog integrity (no test execution)
mvn exec:java -pl Automation-Framework/automation-api \
  -Dexec.mainClass="com.jaya.automation.api.contract.CatalogValidationRunner"
```

## Adding a New Service

1. Create `config/endpoints/<new-service>/` with domain YAML files.
2. Create `schemas/<new-service>/<domain>/` and add response schemas.
3. Create `payloads/<new-service>/<domain>/` if POST/PUT payloads are needed.
4. Create `features/api/<new-service>/<domain>/` and write feature files.

See `docs/FEATURE_AUTHORING_GUIDE.md` for the complete 5-step workflow.
