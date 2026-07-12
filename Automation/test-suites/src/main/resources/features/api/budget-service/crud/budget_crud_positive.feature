@budget-service @api @positive @crud
Feature: Budget Service CRUD positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke
  Scenario: Create a budget with valid payload
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    And the response field "id" should be present
    And the response field "name" should equal "Auto Test Budget"
    And the response should match the "budget-item" schema
    And store response field "id" as "budget.id"

  @smoke
  Scenario: Retrieve a budget by ID
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    And store response field "id" as "budget.id"
    When the user sends a GET request to "budgets.by-id" with data
      | key           | value         |
      | path.budgetId | ${budget.id}  |
    Then the request should succeed
    And the response field "id" should be present
    And the response field "name" should equal "Auto Test Budget"
    And the response should match the "budget-item" schema

  @smoke
  Scenario: List all budgets for the logged-in user
    When the user sends a GET request to "budgets.list"
    Then the request should succeed
    And the response should match the "budget-list" schema

  Scenario: Update a budget with valid payload
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    And store response field "id" as "budget.id"
    Given request body "updateBudget" uses the "update-budget-valid" payload
    When the user sends a PUT request to "budgets.update" using request body "updateBudget" with data
      | key           | value         |
      | path.budgetId | ${budget.id}  |
    Then the request should succeed
    And the response field "name" should equal "Updated Auto Test Budget"
    And the response field "amount" should equal "7500.0"
    And the response should match the "budget-item" schema

  Scenario: Delete a single budget
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    And store response field "id" as "budget.id"
    When the user sends a DELETE request to "budgets.delete" with data
      | key           | value         |
      | path.budgetId | ${budget.id}  |
    Then the response status should be 204

  Scenario: Delete all budgets for the logged-in user
    Given request body "createBudget" uses the "create-budget-valid" payload
    When the user sends a POST request to "budgets.create" using request body "createBudget"
    Then the response status should be 201
    When the user sends a DELETE request to "budgets.delete-all"
    Then the response status should be 204
