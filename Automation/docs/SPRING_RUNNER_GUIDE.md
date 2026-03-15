# Spring Runner Guide

## Purpose

Hybrid execution supports two runner modes:

- `plain`: lightweight TestNG+Cucumber execution.
- `spring`: Spring Boot-backed Cucumber context execution.

## Key Classes

- Plain runner: `automation-bdd/.../AutomationCucumberTest`
- Spring runner: `automation-bdd/.../SpringBootCucumberTest`
- Spring bridge: `automation-bdd/.../SpringCucumberConfiguration`
- Spring boot test app: `automation-bdd/.../SpringTestApplication`

## Local Usage

Plain:

```bash
mvn -pl automation-app -am exec:java -Dexec.args="--run-only --runner=plain --suite=smoke --env=local --engine=playwright --tags=@smoke"
```

Spring:

```bash
mvn -pl automation-app -am exec:java -Dexec.args="--run-only --runner=spring --suite=smoke --env=qa --engine=playwright --tags=@smoke"
```

## Suite XML Files

- `automation-bdd/src/test/resources/testng/smoke.xml`
- `automation-bdd/src/test/resources/testng/regression.xml`
- `automation-bdd/src/test/resources/testng/api.xml`
- `automation-bdd/src/test/resources/testng/ui.xml`

## Notes

- Use `--features-path` to override classpath suite paths when needed.
- Use `--rerun-failures` to replay failed scenarios from rerun output.
- `@template` scenarios are documentation-only and skipped by hooks.
- For reusable scenario writing, follow `docs/FEATURE_AUTHORING_GUIDE.md`.
