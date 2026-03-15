# Enterprise Patterns

## Platform Model

- `automation-app` orchestrates execution entrypoints.
- `automation-bdd` owns Cucumber/TestNG runners and hooks.
- `test-suites` packages feature/data/config assets for classpath execution.
- `docker` contains runtime image entrypoints.
- `helm` contains Kubernetes Job deployment templates.
- `pipeline` contains CI/CD workflows.

## Runner Standards

- CLI mode supports `--run-only` and `--start-run`.
- Runner type supports `--runner=plain|spring`.
- Suite selection supports `--suite=smoke|regression|api|ui`.
- Cucumber paths resolve from `classpath:features`.

## Test Authoring Standards

- Hybrid DSL is mandatory: generic API/UI steps first, minimal domain shortcuts only when needed.
- API authoring uses endpoint keys, not hardcoded URLs.
- DataTable key/value format is the default authoring model.
- Dynamic values resolve via `${ctx.*}`, `${suite.*}`, `${random.*}`, `${now...}`.
- Reference guide: `docs/FEATURE_AUTHORING_GUIDE.md`.

## Configuration Standards

- Runtime settings are env/system-property driven.
- Secrets are never committed in source files.
- Pipeline and Helm inject secrets from secret stores or external secret objects.
- All artifact paths are run-scoped by `AUTOMATION_RUN_ID`.

## Folder Standards

- `test-suites/src/main/resources/features/<domain>/...`
- `test-suites/src/main/resources/features/templates/...`
- `test-suites/src/main/resources/testdata/<env>/<domain>/...`
- `test-suites/src/main/resources/testdata/request-templates/<domain>/...`
- `test-suites/src/main/resources/testdata/expected-fragments/<domain>/...`
- `test-suites/src/main/resources/config/...`
- `tools/feature_generation`, `tools/data_generation`, `tools/reporting`

## Anti-Pattern Bans

- No hardcoded report locations tied to local machine paths.
- No direct plaintext credentials in committed YAML/props/scripts.
- No ad-hoc shell flags without typed CLI parser support.
- No monolithic runner classes with mixed orchestration and execution logic.
