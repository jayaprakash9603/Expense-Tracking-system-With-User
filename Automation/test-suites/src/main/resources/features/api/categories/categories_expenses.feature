@categories @api @regression
Feature: Category-Expense Linking API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Get expenses for a category
    Given request body "categoryPayload" is defined as
      | field        | value                            |
      | categoryName | Link Cat ${random.number:4}      |
      | description  | Category for linking test        |
      | type         | expense                          |
    When the user sends a POST request to "categories.create" using request body "categoryPayload"
    Then the request should succeed
    And store response field "id" as "categoryId"
    When the user sends a GET request to "categories.expenses" with data
      | field           | value          |
      | path.categoryId | ${categoryId}  |
    Then the request should succeed

  Scenario: Get filtered expenses for a category
    Given request body "categoryPayload" is defined as
      | field        | value                              |
      | categoryName | Filter Cat ${random.number:4}      |
      | description  | Category for filter test           |
      | type         | expense                            |
    When the user sends a POST request to "categories.create" using request body "categoryPayload"
    Then the request should succeed
    And store response field "id" as "categoryId"
    When the user sends a GET request to "categories.filtered-expenses" with data
      | field           | value          |
      | path.categoryId | ${categoryId}  |
    Then the request should succeed
