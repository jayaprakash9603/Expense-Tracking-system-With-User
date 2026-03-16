@budget-service @api @positive @query
Feature: Budget Service query and lookup positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke
  Scenario: Get expenses within a budget date range
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    And store response field "id" as "budget.id"
    When the user sends a GET request to "budgets.expenses" with data
      | key           | value         |
      | path.budgetId | ${budget.id}  |
    Then the request should succeed
    And the response should match the "budget-expense-list" schema

  @smoke
  Scenario: Filter budgets by date
    When the user sends a GET request to "budgets.filter-by-date" with data
      | key        | value      |
      | query.date | 2026-06-15 |
    Then the request should succeed
    And the response should match the "budget-list" schema

  Scenario: Get budgets associated with an expense
    Given value "today" is set to "${now:yyyy-MM-dd}"
    When the user sends a GET request to "budgets.budgets-for-expense" with data
      | key              | value      |
      | query.expenseId  | 1          |
      | query.date       | ${today}   |
    Then the request should succeed

  @smoke
  Scenario: Search budgets by query string
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    When the user sends a GET request to "budgets.search" with data
      | key         | value |
      | query.query | Auto  |
      | query.limit | 20    |
    Then the request should succeed
    And the response should match the "budget-search-list" schema
