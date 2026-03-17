@template @api @scenarioid @dsl
Feature: ScenarioID-based API workflow template
  # ┌──────────────────────────────────────────────────────────────────┐
  # │  COPY THIS FILE to features/api/<service>/<domain>/<name>.feature│
  # │  Replace placeholders:                                           │
  # │    BookAppointment_NEW-14 → your scenarioID convention           │
  # │    [endpoint.key]         → key from endpoints YAML              │
  # │    [schema-key]           → schema filename without .schema.json │
  # │    [payload-key]          → payload filename without .json       │
  # │                                                                  │
  # │  ScenarioID naming convention:                                   │
  # │    <Feature>_<Plan>-<Number>                                     │
  # │    Examples:                                                     │
  # │      BookAppointment_NEW-14                                      │
  # │      CreateExpense_API-01                                        │
  # │      FetchBudget_SMOKE-02                                        │
  # │                                                                  │
  # │  ScenarioID-aware steps scope aliases and tokens per ID          │
  # │  while still using the shared GenericApiSteps DSL for            │
  # │  request execution and response validation.                     │
  # └──────────────────────────────────────────────────────────────────┘

  # ── ScenarioID-scoped API Setup + CRUD ─────────────────────────────
  @api @smoke
  Scenario: ScenarioID-scoped GET request for BookAppointment_NEW-14
    Given api testing is ready for scenarioID "BookAppointment_NEW-14"
    And the user is logged in with test credentials for scenarioID "BookAppointment_NEW-14"
    When the user sends a GET request to "[endpoint.key]"
    Then the response status should be 200 for scenarioID "BookAppointment_NEW-14"
    And the response field "id" should be present

  # ── ScenarioID-scoped POST with inline body ─────────────────────────
  @api @smoke
  Scenario: ScenarioID-scoped POST for CreateExpense_API-01
    Given api testing is ready for scenarioID "CreateExpense_API-01"
    And the user is logged in with test credentials for scenarioID "CreateExpense_API-01"
    And request body "expensePayload" is defined as for scenarioID "CreateExpense_API-01"
      | key         | value              |
      | description | Test Expense       |
      | amount      | 100.00             |
      | category    | Food               |
    When the user sends a POST request to "[endpoint.key]" using request body "expensePayload"
    Then the response status should be 201 for scenarioID "CreateExpense_API-01"
    And store response field "id" as "expense.id" for scenarioID "CreateExpense_API-01"

  # ── ScenarioID-scoped aliasing and cross-step data flow ─────────────
  @api @regression
  Scenario: ScenarioID-scoped alias chaining for FetchBudget_SMOKE-02
    Given api testing is ready for scenarioID "FetchBudget_SMOKE-02"
    And the user is logged in with test credentials for scenarioID "FetchBudget_SMOKE-02"
    And value "budget.name" is set to "Monthly Groceries" for scenarioID "FetchBudget_SMOKE-02"
    When the user sends a POST request to "[endpoint.key]" with data
      | key    | value                |
      | name   | ${budget.name}       |
      | limit  | 500                  |
    Then the request should succeed
    And store response field "id" as "budget.id" for scenarioID "FetchBudget_SMOKE-02"
    And the scoped value "budget.id" for scenarioID "FetchBudget_SMOKE-02" should equal "${budget.id}"

  # ── Mixed: scenarioID-aware setup with generic execution steps ──────
  @api @regression
  Scenario: Mixed scenarioID setup with standard API steps
    Given api testing is ready for scenarioID "MixedFlow_REG-05"
    And the user is logged in with test credentials for scenarioID "MixedFlow_REG-05"
    When the user sends a GET request to "[endpoint.key]"
    Then the request should succeed
    And the response field "name" should contain "Test"
