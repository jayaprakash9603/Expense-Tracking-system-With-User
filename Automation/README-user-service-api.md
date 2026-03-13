# User-Service API Automation

This suite implements phase-wise API automation for `Expense-tracking-backend/user-service` with reusable Cucumber steps, endpoint registry contracts, payload templates, and JSON-schema assertions.

## Locations

- Features: `Automation/test-suites/src/main/resources/features/api/user-service/`
- Payloads: `Automation/test-suites/src/main/resources/payloads/user-service/`
- Schemas: `Automation/test-suites/src/main/resources/schemas/user-service/`
- Endpoint registry: `Automation/automation-api/src/main/java/com/jaya/automation/api/contract/ApiEndpointRegistry.java`

## Run By Tag/Profile

- Smoke: `mvn test -pl automation-bdd -Psmoke`
- Phase 1: `mvn test -pl automation-bdd -Pphase1`
- Phase 2: `mvn test -pl automation-bdd -Pphase2`
- Phase 3: `mvn test -pl automation-bdd -Pphase3`
- Phase 4: `mvn test -pl automation-bdd -Pphase4`
- Regression: `mvn test -pl automation-bdd -Pregression`

Direct tag override:

- `mvn test -pl automation-bdd -Dcucumber.filter.tags="@api and @auth and not @negative"`

## Tag Taxonomy

- `@Phase1` auth/oAuth2/MFA
- `@Phase2` core user APIs
- `@Phase3` role/admin/analytics
- `@Phase4` report preferences
- `@smoke`, `@regression`, `@auth`, `@validation`, `@negative`, `@admin`, `@mfa`, `@preferences`

## Add New Endpoint In 5 Steps

1. Register endpoint key in `ApiEndpointRegistry`.
2. Add payload under `payloads/user-service/<controller>/` if request body is needed.
3. Add/extend schema under `schemas/user-service/<controller>/`.
4. Add scenario in the matching feature under `features/api/user-service/...`.
5. Execute smoke + targeted phase profile and confirm schema + auth + negative coverage.

## Schema Authoring Guidelines

- Keep schema strict on critical contract fields (`required`), permissive on non-critical fields (`additionalProperties: true`).
- Put reusable error schemas in `schemas/user-service/common/`.
- Use dedicated success schema per response type where response shape is stable.
- Validate both success and failure contracts for every protected endpoint.

## Payload Authoring Guidelines

- Prefer payload files for reusable request shapes.
- Use inline data tables when payload values are scenario-specific.
- Keep dynamic data in steps (`${random.email}`, alias references) to avoid hardcoded collisions.

## CI Layout

- PR: smoke (`-Psmoke`)
- Nightly: regression (`-Pregression`)
- Optional split jobs: phase1/phase2/phase3/phase4 profiles

## Data Isolation

- Disposable users/roles created by steps are tracked and cleaned by `ApiCleanupHooks`.
- Avoid static test emails for mutating flows; use random aliases where possible.
