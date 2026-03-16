# Feature Authoring Guide

## Add a New Endpoint in 5 Steps

### Step 1 — Register the endpoint

Add an entry to the service's domain YAML file under `test-suites/src/main/resources/config/endpoints/<service>/<domain>.yaml`:

```yaml
- key: budgets.create
  method: POST
  path: /api/budgets
  auth: true
```

If the service or domain file doesn't exist yet, create the folder and file following the naming convention below.

**Key naming rule:** `<domain>.<action>` or `<domain>.<subdomain>.<action>` (e.g. `auth.mfa.setup`, `expenses.bulk-add`).

### Step 2 — Add JSON schema for the response

Place the schema at `test-suites/src/main/resources/schemas/<service>/<domain>/<name>.schema.json`.

The schema key used in feature files is the filename minus `.schema.json` (e.g. `budget-create-success`).

### Step 3 — (Optional) Add a request payload

Place payload JSON at `test-suites/src/main/resources/payloads/<service>/<domain>/<name>.json`.

### Step 4 — Write the feature file

Copy the positive template from `features/api/templates/positive-api-template.feature` to `features/api/<service>/<domain>/<name>.feature` and replace placeholders.

### Step 5 — Run and verify

```bash
mvn test -pl test-suites -Dcucumber.filter.tags="@smoke and @api"
```

## Folder Conventions

```
test-suites/src/main/resources/
├── config/
│   └── endpoints/                          ← endpoint catalog (per-service, per-domain)
│       ├── user-service/
│       │   ├── auth.yaml
│       │   ├── user.yaml
│       │   ├── admin.yaml
│       │   └── preferences.yaml
│       ├── expense-service/
│       │   ├── expenses.yaml
│       │   └── bulk.yaml
│       ├── budget-service/
│       │   └── budgets.yaml
│       ├── friendship-service/
│       │   └── friendships.yaml
│       ├── group-service/
│       │   └── groups.yaml
│       ├── sharing-service/
│       │   └── sharing.yaml
│       ├── event-service/
│       │   └── events.yaml
│       └── chat-service/
│           └── chat.yaml
├── schemas/                                ← response JSON schemas
│   ├── user-service/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── admin/
│   │   ├── analytics/
│   │   ├── mfa/
│   │   ├── roles/
│   │   ├── preferences/
│   │   └── common/
│   ├── expense-service/
│   ├── budget-service/
│   ├── friendship-service/
│   ├── group-service/
│   ├── sharing-service/
│   ├── event-service/
│   └── chat-service/
├── payloads/                               ← request body templates (optional)
│   ├── user-service/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── admin/
│   │   ├── mfa/
│   │   ├── roles/
│   │   └── preferences/
│   ├── expense-service/
│   ├── budget-service/
│   ├── friendship-service/
│   ├── group-service/
│   ├── sharing-service/
│   ├── event-service/
│   └── chat-service/
└── features/
    ├── api/
    │   ├── templates/                      ← copy-paste starters
    │   └── <service>/<domain>/<name>.feature
    └── ui/
        └── <domain>/<name>.feature
```

### Service-to-Backend Mapping

| Endpoint Service | Backend Microservice | Domains |
| --- | --- | --- |
| `user-service` | user-service | auth, user, admin, roles, mfa, preferences, analytics |
| `expense-service` | Expense-Service | expenses, bulk |
| `budget-service` | Budget-Service | budgets |
| `friendship-service` | FriendShip-Service | friendships |
| `group-service` | Group-Service (if separate) | groups |
| `sharing-service` | Sharing-Service (if separate) | shares |
| `event-service` | Event-Service | events |
| `chat-service` | Chat-Service | chats, presence |

Additional backend services (not yet in the catalog — add when ready):
`AnalyticsService`, `Audit-Service`, `Bill-Service`, `Category-Service`, `Notification-Service`, `Payment-method-Service`, `Search-Service`, `Story-Service`

## Reuse-First Policy

Use existing generic steps first. Add a new step definition only when the capability cannot be expressed by:

- endpoint key + generic API step
- generic UI navigation/form/action steps
- DataTable key/value inputs
- dynamic placeholders (`ctx`, `suite`, `random`, `now`)

## Generic API Step DSL

### Setup

- `Given api testing is ready`
- `Given the user is logged in with test credentials`
- `Given the user uses token alias "<alias>"`

### Request body

- `Given request body "<alias>" is defined as` (with DataTable)
- `Given request body "<alias>" is loaded from payload file "<path>"`
- `Given request body "<alias>" uses the "<payloadKey>" payload`
- `Given value "<alias>" is set to "<value>"`

### Sending requests

- `When the user sends a <METHOD> request to "<endpoint-key>"`
- `When the user sends a <METHOD> request to "<endpoint-key>" with data` (DataTable)
- `When the user sends a <METHOD> request to "<endpoint-key>" using request body "<alias>"`
- `When the user sends a <METHOD> request to "<endpoint-key>" using request body "<alias>" with data`

### Response assertions

- `Then the request should succeed`
- `Then the response status should be <code>`
- `Then the response status should be one of "<csv-codes>"`
- `Then the response should indicate "<label>"` (success, bad request, unauthorized, forbidden, not found, conflict, server error)
- `Then the response field "<jsonPath>" should equal "<value>"`
- `Then the response field "<jsonPath>" should contain "<value>"`
- `Then the response field "<jsonPath>" should be present`
- `Then the response list "<jsonPath>" should have size <n>`
- `Then the response list "<jsonPath>" should have at least <n> items`
- `Then the response list "<jsonPath>" should contain "<value>"`
- `Then the response body should equal "<value>"`
- `Then the response body should contain "<value>"`
- `Then the response should contain error message "<value>"`

### Schema validation

- `Then the response should match the "<schemaKey>" schema`
- `Then the response should match schema "<classpathPath>"`

### Storing values

- `Then store response field "<jsonPath>" as "<alias>"`
- `Then store response body as "<alias>"`

## Generic UI Step DSL

- `Given generic ui executor is ready`
- `When user navigates to "<domain>" domain page`
- `Then "<domain>" domain page should be loaded`
- `When user fills ui form with data`
- `When user fills ui form from current data row`
- `When user clicks ui action "<actionKey>"`
- `Then ui text key "<textKey>" should contain "<value>"`
- `Then ui element "<elementKey>" should be visible`
- `Then save ui text "<textKey>" as alias "<alias>"`

## DataTable Contract

| Prefix | Meaning | Example |
| --- | --- | --- |
| `path.<name>` | path parameter | `path.userId` |
| `query.<name>` | query parameter | `query.page` |
| `header.<name>` | request header | `header.X-Custom` |
| `<field>` | request body field | `name`, `amount` |

## Dynamic Value Rules

- `${ctx.<alias>}` — scenario alias from prior steps
- `${suite.<key>}` — value from suite-data properties
- `${random.uuid}` / `${random.number:6}` / `${random.email}`
- `${now}` / `${now+1d:yyyy-MM-dd}` / `${now-2h:yyyy-MM-dd'T'HH:mm}`
- `${saved.<alias>}` — value stored via "store response field" step

## Templates

| Template | Location | Purpose |
| --- | --- | --- |
| Positive | `features/api/templates/positive-api-template.feature` | GET/POST/PUT/DELETE happy path with schema validation |
| Negative | `features/api/templates/negative-api-template.feature` | Validation errors, not-found, conflicts |
| Auth | `features/api/templates/auth-api-template.feature` | Unauthenticated, invalid token, forbidden |
| Patterns | `features/api/templates/api-validation-patterns.feature` | Working reference examples |

## Preflight Validation

Before running tests, validate catalog integrity:

```bash
mvn exec:java -pl Automation-Framework/automation-api \
  -Dexec.mainClass="com.jaya.automation.api.contract.CatalogValidationRunner"
```

Checks performed:
- Duplicate endpoint keys across all service/domain YAML files
- Invalid HTTP methods
- Missing required fields (key, method, path)
- Feature files referencing undefined endpoint keys
- Schema keys referenced in features but missing from `schemas/`
- Catalog endpoints with no feature coverage (warning)

## Migration Guidance

- Keep old scenarios and shortcut steps running.
- Add new generic scenarios alongside legacy scenarios.
- Move legacy scenarios to endpoint-key/DataTable style incrementally.
- Do not delete old steps until all dependent features are migrated.
