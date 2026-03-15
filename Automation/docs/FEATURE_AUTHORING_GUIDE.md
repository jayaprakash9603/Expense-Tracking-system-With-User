# Feature Authoring Guide

## Reuse-First Policy

Use existing generic steps first. Add a new step definition only when the capability cannot be expressed by:

- endpoint key + generic API step
- generic UI navigation/form/action steps
- DataTable key/value inputs
- dynamic placeholders (`ctx`, `suite`, `random`, `now`)

If a new requirement is domain-specific but common, add a minimal shortcut step that delegates to generic infrastructure.

## Preferred Step DSL

### Generic API steps

- `Given generic api executor is ready`
- `Given api payload alias "<alias>" is defined as`
- `Given api alias "<alias>" is set to "<value>"`
- `Given api session token is generated from configured credentials`
- `When client sends <METHOD> request to endpoint "<endpoint-key>"`
- `When client sends <METHOD> request to endpoint "<endpoint-key>" with payload alias "<alias>"`
- `When client sends <METHOD> request to endpoint "<endpoint-key>" with data`
- `Then api response status should be <code>`
- `Then api response status should be one of "<csv-codes>"`
- `Then api response should be successful|unauthorized|forbidden|bad request`
- `Then api response at "<jsonPath>" should equal|contain "<value>"`
- `Then api response at "<jsonPath>" should be present`
- `Then api response list at "<jsonPath>" should have size <n>`
- `Then api response list at "<jsonPath>" should have at least <n> items`
- `Then api response list at "<jsonPath>" should contain "<value>"`
- `Then save api response at "<jsonPath>" as alias "<alias>"`

### Generic UI steps

- `Given generic ui executor is ready`
- `When user navigates to "<domain>" domain page`
- `Then "<domain>" domain page should be loaded`
- `When user fills ui form with data`
- `When user fills ui form from current data row`
- `When user clicks ui action "<actionKey>"`
- `Then ui text key "<textKey>" should contain "<value>"`
- `Then ui element "<elementKey>" should be visible`
- `Then save ui text "<textKey>" as alias "<alias>"`

### Existing shortcuts kept for compatibility

- auth API shortcuts in `AuthApiSteps`
- auth UI shortcuts in `AuthUiSteps`
- domain skeleton checks in `FeatureSkeletonSteps`

## Endpoint Keys

Use endpoint keys from the registry in `automation-api` (examples):

- auth: `auth.signin`, `auth.verify-login-otp`, `auth.mfa.verify`
- user/admin/roles: `user.profile`, `admin.users.list`, `roles.list`
- expenses/bulk: `expenses.create`, `expenses.paginated`, `bulk.expenses-budgets.create`
- budgets: `budgets.create`, `budgets.reports`
- friends/groups/sharing: `friendships.request`, `groups.create`, `shares.my`
- events/chat/presence: `events.list-user`, `chats.conversations`, `presence.friends`

## DataTable Contract

Use key/value rows:

| key | value |
| --- | --- |
| `path.<name>` | path parameter |
| `query.<name>` | query parameter |
| `header.<name>` | request header |
| `<payloadField>` | request body field |

## Dynamic Value Rules

- `${ctx.<alias>}`: scenario alias from prior steps
- `${suite.<key>}`: value from `test-suites` suite-data properties
- `${random.uuid}` / `${random.number:6}` / `${random.email}`
- `${now}` / `${now+1d:yyyy-MM-dd}` / `${now-2h:yyyy-MM-dd'T'HH:mm}`

## Data Source Precedence

1. DataTable values
2. Scenario Outline examples
3. `test-suites` suite data
4. runtime config defaults

## Validation Patterns

Author scenarios using the standard patterns in `features/templates/api-validation-patterns.feature`:

- happy path
- negative/validation
- auth/permission
- pagination
- filtering

## Migration Guidance

- Keep old scenarios and shortcut steps running.
- Add new generic scenarios alongside legacy scenarios.
- Move legacy scenarios to endpoint-key/DataTable style incrementally.
- Do not delete old steps until all dependent features are migrated.
