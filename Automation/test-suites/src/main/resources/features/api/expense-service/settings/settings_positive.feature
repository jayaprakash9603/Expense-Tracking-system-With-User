@expense @api @positive @settings
Feature: expense-service settings API positive scenarios

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
      | expenses.filter |
      | expenses.fuzzy-search |
      | expenses.between-dates |
      | expenses.top-n |
      | expenses.today |
      | expenses.current-month |
      | expenses.last-month |
      | expenses.cashflow |
      | expenses.gain |
      | expenses.loss |
      | expenses.excel-report |
      | expenses.reports-history |
