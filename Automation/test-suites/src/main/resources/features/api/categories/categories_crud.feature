@categories @api @regression
Feature: Category Service CRUD API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke
  Scenario: Create a new category
    Given request body "categoryPayload" is defined as
      | field        | value                              |
      | categoryName | Test Cat ${random.number:4}        |
      | description  | Auto-generated test category       |
      | type         | expense                            |
    When the user sends a POST request to "categories.create" using request body "categoryPayload"
    Then the request should succeed
    And the response field "id" should be present
    And the response field "categoryName" should contain "Test Cat"
    And store response field "id" as "createdCategoryId"

  Scenario: Get category by ID
    Given request body "categoryPayload" is defined as
      | field        | value                            |
      | categoryName | Fetch Cat ${random.number:4}     |
      | description  | Category for fetch test          |
      | type         | expense                          |
    When the user sends a POST request to "categories.create" using request body "categoryPayload"
    Then the request should succeed
    And store response field "id" as "categoryId"
    When the user sends a GET request to "categories.by-id" with data
      | field   | value          |
      | path.id | ${categoryId}  |
    Then the response status should be 200
    And the response field "categoryName" should contain "Fetch Cat"

  Scenario: Update a category
    Given request body "categoryPayload" is defined as
      | field        | value                             |
      | categoryName | Update Cat ${random.number:4}     |
      | description  | Category for update test          |
      | type         | expense                           |
    When the user sends a POST request to "categories.create" using request body "categoryPayload"
    Then the request should succeed
    And store response field "id" as "categoryId"
    Given request body "updatePayload" is defined as
      | field        | value                |
      | categoryName | Updated Category     |
      | description  | Updated description  |
    When the user sends a PUT request to "categories.update" using request body "updatePayload" with data
      | field   | value          |
      | path.id | ${categoryId}  |
    Then the response status should be 200
    And the response field "categoryName" should equal "Updated Category"

  Scenario: Delete a category
    Given request body "categoryPayload" is defined as
      | field        | value                              |
      | categoryName | Delete Cat ${random.number:4}      |
      | description  | Category for delete test           |
      | type         | expense                            |
    When the user sends a POST request to "categories.create" using request body "categoryPayload"
    Then the request should succeed
    And store response field "id" as "categoryId"
    When the user sends a DELETE request to "categories.delete" with data
      | field   | value          |
      | path.id | ${categoryId}  |
    Then the response status should be 200

  Scenario: List all categories
    When the user sends a GET request to "categories.list"
    Then the request should succeed

  Scenario: Search categories
    When the user sends a GET request to "categories.search" with data
      | field       | value |
      | query.query | Test  |
    Then the request should succeed

  Scenario: Get uncategorized expenses
    When the user sends a GET request to "categories.uncategorized"
    Then the request should succeed
