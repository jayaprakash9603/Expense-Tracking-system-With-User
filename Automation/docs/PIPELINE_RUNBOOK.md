# Pipeline Runbook

## Jenkins Location

- Pipeline file: `pipeline/Jenkinsfile`

## Pipeline Stages

1. Build (`mvn clean compile`)
2. Static analysis gate (`mvn test-compile -DskipTests`)
3. Package (`mvn package -DskipTests`)
4. Docker image build and push
5. Optional Helm deploy
6. Smoke execution via `automation-app`
7. Report archiving

## Required Parameters

- `RUNNER_TYPE`: `spring` or `plain`
- `AUTOMATION_ENGINE`: `playwright` or `selenium`
- `TEST_ENV`: target environment
- `SUITE`: `smoke|regression|api|ui`
- `CUCUMBER_TAGS`: tag expression
- `DOCKER_IMAGE` and `DOCKER_TAG`

## Helm Deployment Notes

- Chart path: `helm/charts/expense-automation-job`
- Set image repository/tag from pipeline params.
- Keep secret creation disabled in chart by default.
- Provide secrets through cluster-managed secret objects.

## Artifacts

- Cucumber reports: `automation-bdd/target/reports`
- Run-scoped artifacts: `target/artifacts/<runId>/...`
