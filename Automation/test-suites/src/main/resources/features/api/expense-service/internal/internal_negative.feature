@expense @api @negative @internal
Feature: expense-service internal API negative scenarios

  Background:
    Given api testing is ready

  @negative @auth
  Scenario: Unauthorized request is rejected
    When the user sends a GET request to "expenses.internal.by-id"
    Then the response status should be one of "401,403,405"

  @negative @auth
  Scenario: Authenticated validation failure on create
    Given the user is logged in with test credentials
