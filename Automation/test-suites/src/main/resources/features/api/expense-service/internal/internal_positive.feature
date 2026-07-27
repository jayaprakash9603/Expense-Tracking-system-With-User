@expense @api @positive @internal
Feature: expense-service internal API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials


  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    And the response should match the "expense-list" schema
    Examples:
      | endpointKey |
      | expenses.internal.search-fuzzy |
