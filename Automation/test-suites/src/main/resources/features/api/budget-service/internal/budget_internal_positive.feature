@budget-service @api @positive @internal
Feature: Budget Service internal endpoint positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke
  Scenario: Save a budget via internal endpoint
    Given request body "saveBudget" uses the "save-budget-valid" payload
    When the user sends a POST request to "budgets.internal.save" using request body "saveBudget"
    Then the request should succeed
    And the response field "id" should be present
    And the response field "name" should equal "Internal Save Budget"
    And the response should match the "budget-item-internal" schema
    And store response field "id" as "budget.id"
    And store response field "userId" as "budget.userId"

  Scenario: Retrieve a budget via internal get-by-id
    Given request body "saveBudget" uses the "save-budget-valid" payload
    When the user sends a POST request to "budgets.internal.save" using request body "saveBudget"
    Then the request should succeed
    And store response field "id" as "budget.id"
    And store response field "userId" as "budget.userId"
    When the user sends a GET request to "budgets.internal.get-by-id" with data
      | key             | value             |
      | query.budgetId  | ${budget.id}      |
      | query.userId    | ${budget.userId}  |
    Then the request should succeed
    And the response field "id" should be present
    And the response should match the "budget-item-internal" schema

  Scenario: List all budgets for a user via internal endpoint
    Given request body "saveBudget" uses the "save-budget-valid" payload
    When the user sends a POST request to "budgets.internal.save" using request body "saveBudget"
    Then the request should succeed
    And store response field "userId" as "budget.userId"
    When the user sends a GET request to "budgets.internal.user-budgets" with data
      | key           | value             |
      | query.userId  | ${budget.userId}  |
    Then the request should succeed
    And the response should match the "budget-list-internal" schema
