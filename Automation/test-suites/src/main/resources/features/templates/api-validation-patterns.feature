@patterns
Feature: Reusable API behavior patterns

  @api @template @dsl @happy-path
  Scenario: User profile is returned successfully
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a GET request to "user.profile"
    Then the request should succeed
    And the response field "id" should be present

  @api @template @dsl @negative
  Scenario: Expense with invalid amount is rejected
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a POST request to "expenses.create" with data
      | key    | value |
      | amount | -1    |
    Then the response status should be one of "400,422"

  @api @template @dsl @authz
  Scenario: Admin list is protected from unauthorized access
    Given api testing is ready
    When the user sends a GET request to "admin.users.list"
    Then the response status should be one of "401,403"

  @api @template @dsl @pagination
  Scenario: Expenses list supports pagination
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a GET request to "expenses.paginated" with data
      | key         | value                  |
      | query.page  | ${suite.api.default.page} |
      | query.limit | ${suite.api.default.limit} |
    Then the response status should be one of "200,400"
    And the response list "content" should have at least 0 items

  @api @template @dsl @filtering
  Scenario: Expenses search returns matching results
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a GET request to "expenses.search" with data
      | key         | value |
      | query.query | Food  |
      | query.limit | 5     |
    Then the response status should be one of "200,400"
    And the response list "$" should contain "Food"
