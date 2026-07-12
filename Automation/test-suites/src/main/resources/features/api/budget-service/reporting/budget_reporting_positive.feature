@budget-service @api @positive @reporting
Feature: Budget Service reporting positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke
  Scenario: Get a single budget report
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    And store response field "id" as "budget.id"
    When the user sends a GET request to "budgets.report" with data
      | key           | value         |
      | path.budgetId | ${budget.id}  |
    Then the request should succeed
    And the response field "budgetId" should be present
    And the response field "budgetName" should be present
    And the response should match the "budget-report-item" schema

  @smoke
  Scenario: Get all budget reports for the logged-in user
    When the user sends a GET request to "budgets.reports"
    Then the request should succeed
    And the response should match the "budget-report-list" schema

  Scenario: Get detailed budget report
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    And store response field "id" as "budget.id"
    When the user sends a GET request to "budgets.detailed-report" with data
      | key           | value         |
      | path.budgetId | ${budget.id}  |
    Then the request should succeed
    And the response should match the "budget-detailed-report" schema

  Scenario: Get detailed budget report with date filters
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    And store response field "id" as "budget.id"
    When the user sends a GET request to "budgets.detailed-report" with data
      | key             | value         |
      | path.budgetId   | ${budget.id}  |
      | query.fromDate  | 2026-01-01    |
      | query.toDate    | 2026-06-30    |
      | query.rangeType | custom        |
      | query.offset    | 0             |
      | query.flowType  | all           |
    Then the request should succeed
    And the response should match the "budget-detailed-report" schema

  Scenario: Get filtered overview of all budgets with expenses
    When the user sends a GET request to "budgets.filtered-overview" with data
      | key             | value  |
      | query.rangeType | month  |
      | query.offset    | 0      |
      | query.flowType  | all    |
    Then the request should succeed
    And the response should match the "budget-filtered-overview" schema
