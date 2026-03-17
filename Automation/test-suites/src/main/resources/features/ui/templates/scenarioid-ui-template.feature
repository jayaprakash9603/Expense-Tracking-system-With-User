@template @ui @scenarioid @dsl
Feature: ScenarioID-based UI workflow template
  # ┌──────────────────────────────────────────────────────────────────┐
  # │  COPY THIS FILE to features/ui/<domain>/<name>.feature          │
  # │  Replace placeholders:                                          │
  # │    BookAppointment_NEW-14 → your scenarioID convention          │
  # │    [domain]               → e.g. expenses, budgets, bills       │
  # │                                                                 │
  # │  ScenarioID naming convention:                                  │
  # │    <Feature>_<Plan>-<Number>                                    │
  # │    Examples:                                                    │
  # │      BookAppointment_NEW-14                                     │
  # │      CreateExpense_REG-01                                       │
  # │      ManageBudget_SMOKE-03                                      │
  # │                                                                 │
  # │  All scenarioID-aware steps automatically register the ID       │
  # │  in BddWorld and store scoped values for data isolation.        │
  # └──────────────────────────────────────────────────────────────────┘

  # ── Browser Setup + Login + Navigation ──────────────────────────────
  @ui @smoke @requiresCredentials @data-optional
  Scenario: Setup browser and login for scenarioID BookAppointment_NEW-14
    Given I want to setup a browser for UI testing for scenarioID "BookAppointment_NEW-14"
    And I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "BookAppointment_NEW-14"
    Then the user should be on "Dashboard" page for scenarioID "BookAppointment_NEW-14"

  # ── Navigate to a Domain Page ───────────────────────────────────────
  @ui @smoke @data-optional
  Scenario: Navigate to domain page for scenarioID BookAppointment_NEW-14
    Given I want to setup a browser for UI testing for scenarioID "BookAppointment_NEW-14"
    And I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "BookAppointment_NEW-14"
    When the user navigates to "Expenses" page for scenarioID "BookAppointment_NEW-14"
    Then the user should be on "expenses" page for scenarioID "BookAppointment_NEW-14"

  # ── Fill Form + Submit + Verify ─────────────────────────────────────
  @ui @regression @data-optional
  Scenario: Complete form workflow for scenarioID CreateExpense_REG-01
    Given I want to setup a browser for UI testing for scenarioID "CreateExpense_REG-01"
    And I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "CreateExpense_REG-01"
    When the user navigates to "Expenses" page for scenarioID "CreateExpense_REG-01"
    And the user fills the form with data for scenarioID "CreateExpense_REG-01"
      | key         | value              |
      | description | Test Expense       |
      | amount      | 100.00             |
    And the user clicks "submit" for scenarioID "CreateExpense_REG-01"
    Then "successMessage" should be visible for scenarioID "CreateExpense_REG-01"
    And store text at "successMessage" as "confirmation" for scenarioID "CreateExpense_REG-01"

  # ── Wait + Verify Element ──────────────────────────────────────────
  @ui @regression @data-optional
  Scenario: Wait and verify elements for scenarioID ManageBudget_SMOKE-03
    Given I want to setup a browser for UI testing for scenarioID "ManageBudget_SMOKE-03"
    And I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "ManageBudget_SMOKE-03"
    When the user navigates to "Budgets" page for scenarioID "ManageBudget_SMOKE-03"
    And I want to wait for 2 seconds for scenarioID "ManageBudget_SMOKE-03"
    Then "budgetListTable" should be visible for scenarioID "ManageBudget_SMOKE-03"
