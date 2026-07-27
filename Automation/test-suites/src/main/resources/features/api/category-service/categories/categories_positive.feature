@category @api @positive @categories
Feature: category-service categories API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Create resource via categories.create
    Given request body "createBody" uses the "category-create-valid" payload
    When the user sends a POST request to "categories.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And the response should match the "category-item" schema
    And the response should pass validation rules for "category-service" "create_category"
    And store response field "data.id" as "category.id"

  @smoke
  Scenario: Retrieve resource by id via categories.by-id
    Given request body "createBody" uses the "category-create-valid" payload
    When the user sends a POST request to "categories.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And store response field "data.id" as "category.id"
    When the user sends a GET request to "categories.by-id" with data
      | key           | value              |
      | path.id     | ${category.id}     |
    Then the response status should be one of "200,404"
    And the response should match the "category-item" schema

  @smoke
  Scenario: List resources via categories.list
    When the user sends a GET request to "categories.list"
    Then the response status should be one of "200,204"
    And the response should match the "category-list" schema

  Scenario: Update resource
    Given request body "createBody" uses the "category-create-valid" payload
    When the user sends a POST request to "categories.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And store response field "data.id" as "category.id"
    When the user sends a PUT request to "categories.update" using request body "createBody" with data
      | key           | value              |
      | path.id | ${category.id} |
    Then the response status should be one of "200,404"

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    And the response should match the "category-list" schema
    Examples:
      | endpointKey |
      | categories.by-name |
      | categories.uncategorized |
      | categories.expenses |
      | categories.filtered-expenses |
      | categories.search |
