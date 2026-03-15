# Folder Conventions

## Modules

- `automation-core`: configuration, context, logging, shared abstractions
- `automation-engine-selenium`: Selenium engine adapter
- `automation-engine-playwright`: Playwright engine adapter with trace/video support
- `automation-ui-flows`: engine-agnostic page objects and business flows
- `automation-api`: domain API client layer
- `automation-data`: Excel dataset loading and partition-aware resolution
- `automation-bdd`: Cucumber + TestNG execution and hooks
- `automation-app`: orchestration entrypoint (`--start-run`, `--run-only`)
- `test-suites`: classpath-packaged feature, data, and config resources
- `docker`: container runtime assets
- `helm`: Kubernetes deployment charts
- `pipeline`: CI/CD workflows
- `tools`: support utilities for feature/data/reporting workflows

## Features

BDD features are grouped by domain under `test-suites/src/main/resources/features`:

- `auth`
- `dashboard`
- `expenses`
- `budgets`
- `friends`
- `groups`
- `sharing`
- `chat`
- `settings`
- `admin`
- `templates` (documentation-only, skipped by `@template`)

## Data

Environment and feature based test data:

- `automation-data/src/test/resources/testdata/<env>/<feature>/*.xlsx`
- `automation-data/src/test/resources/templates/*.xlsx`
- `test-suites/src/main/resources/testdata/<env>/<feature>/*`
- `test-suites/src/main/resources/testdata/request-templates/<domain>/*`
- `test-suites/src/main/resources/testdata/expected-fragments/<domain>/*`
- `test-suites/src/main/resources/config/suite-data*.properties`

## Artifacts

Run-scoped output:

- `<ARTIFACTS_ROOT>/<AUTOMATION_RUN_ID>/automation-bdd/screenshots`
- `<ARTIFACTS_ROOT>/<AUTOMATION_RUN_ID>/automation-bdd/videos`
- `<ARTIFACTS_ROOT>/<AUTOMATION_RUN_ID>/automation-bdd/traces`
- `<ARTIFACTS_ROOT>/<AUTOMATION_RUN_ID>/automation-bdd/logs`
- `<ARTIFACTS_ROOT>/<AUTOMATION_RUN_ID>/automation-bdd/reports`
