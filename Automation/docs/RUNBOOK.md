# Automation Runbook

## 1) Run Modes

### Start and run (`--start-run`)

Use when the application is not already running.

```bash
mvn -pl automation-app exec:java -Dexec.args="--start-run --runner=spring --suite=smoke --env=local --engine=playwright --tags=@smoke"
```

Required bootstrap properties for this mode:

- `APP_START_CMD`
- `APP_READY_URL`
- optional: `APP_STOP_CMD`, `APP_WORKDIR`, `APP_READY_TIMEOUT_SEC`

Example:

```bash
mvn -pl automation-app exec:java -Dexec.args="--start-run --runner=spring --suite=smoke --env=local --engine=playwright --tags=@smoke" -DAPP_START_CMD="docker compose up -d" -DAPP_STOP_CMD="docker compose down" -DAPP_READY_URL="http://localhost:8080/actuator/health"
```

### Run only (`--run-only`)

Use when the target app is already up.

```bash
mvn -pl automation-app exec:java -Dexec.args="--run-only --runner=plain --suite=api --env=qa --engine=selenium --tags=@auth"
```

Runner flags:

- `--runner=plain|spring`
- `--suite=smoke|regression|api|ui`
- `--features-path=<classpath-or-file-path>`

## 2) Data-Driven Execution (Excel)

Set workbook properties:

```bash
mvn -pl automation-bdd test -DTEST_ENV=local -DDATA_WORKBOOK_PATH=automation-data/src/test/resources/testdata/local/auth/auth-dataset.xlsx -DDATA_SHEET=default -DDATA_ITERATION=0 -DDATA_PARTITION_INDEX=0 -DDATA_PARTITIONS=1
```

Excel requirements:

- First row is header
- `scenario` column is mandatory
- Use exact scenario name or `*`
- Other columns are consumed by steps (`username`, `password`, `expected_error`, etc.)

## 3) Artifacts, Trace, Video

Artifacts are stored under:

- `ARTIFACTS_ROOT/<runId>/automation-bdd/...`
- `.../screenshots`
- `.../videos`
- `.../traces`
- `.../logs`

Controls:

- `AUTOMATION_RUN_ID`
- `ARTIFACTS_ROOT`
- `CAPTURE_SCREENSHOT_ALWAYS`
- `RECORD_TRACE`
- `RECORD_VIDEO`

Example:

```bash
mvn -pl automation-bdd test -DAUTOMATION_RUN_ID=release7_smoke_001 -DARTIFACTS_ROOT=target/artifacts -DCAPTURE_SCREENSHOT_ALWAYS=true -DRECORD_TRACE=true -DRECORD_VIDEO=true
```

## 4) Retry and Rerun

Retry controls:

- `RETRY_COUNT`: retries per failed scenario in TestNG
- `RERUN_FAILED_COUNT`: Surefire rerun count for failing tests

Rerun failed scenarios from rerun file:

```bash
mvn -pl automation-app exec:java -Dexec.args="--run-only --rerun-failures"
```

The rerun source file is:

- `automation-bdd/target/reports/rerun/rerun.txt`

## 5) Endpoint-Key and DataTable Authoring

Preferred feature model:

- use endpoint keys from the API endpoint registry
- use generic API/UI steps
- use DataTable `key | value` with `path.`, `query.`, `header.` prefixes
- use `${ctx.*}` and `${suite.*}` interpolation for dynamic values

Template scenarios:

- `@template` scenarios in `test-suites/src/main/resources/features/templates` are intentionally skipped and act as reusable authoring references.
- detailed authoring policy is in `docs/FEATURE_AUTHORING_GUIDE.md`.
