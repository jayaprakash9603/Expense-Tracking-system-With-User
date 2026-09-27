@expense @api @positive @expenses
Feature: expense-service expenses API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Create resource via expenses.create
    Given request body "createBody" uses the "expense-create-valid" payload
    When the user sends a POST request to "expenses.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And the response should match the "expense-item" schema
    And the response should pass validation rules for "expense-service" "create_expense"
    And store response field "id" as "expense.id"

  @smoke
  Scenario: Retrieve resource by id via expenses.by-id
    Given request body "createBody" uses the "expense-create-valid" payload
    When the user sends a POST request to "expenses.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And store response field "id" as "expense.id"
    When the user sends a GET request to "expenses.by-id" with data
      | key           | value              |
      | path.id     | ${expense.id}     |
    Then the response status should be one of "200,404"
    And the response should match the "expense-item" schema

  @smoke
  Scenario: List resources via expenses.list
    When the user sends a GET request to "expenses.list"
    Then the response status should be one of "200,204"
    And the response should match the "expense-list" schema

  Scenario: Update resource
    Given request body "createBody" uses the "expense-create-valid" payload
    When the user sends a POST request to "expenses.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And store response field "id" as "expense.id"
    When the user sends a PUT request to "expenses.update" using request body "createBody" with data
      | key           | value              |
      | path.id | ${expense.id} |
    Then the response status should be one of "200,404"

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    And the response should match the "expense-list" schema
    Examples:
      | endpointKey |
      | expenses.paginated |
      | expenses.detailed |
      | expenses.search |
      | expenses.summary |
      | expenses.payment-summary |
      | expenses.monthly-summary |
      | expenses.yearly-summary |
      | expenses.bulk-progress |
