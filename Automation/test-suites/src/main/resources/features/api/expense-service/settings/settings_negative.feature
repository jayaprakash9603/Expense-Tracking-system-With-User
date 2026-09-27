@expense @api @negative @settings
Feature: expense-service settings API negative scenarios

  Background:
    Given api testing is ready

  @negative @auth
  Scenario: Unauthorized request is rejected
    When the user sends a GET request to "settings.get"
    Then the response status should be one of "401,403,405"

  @negative @auth
  Scenario: Authenticated validation failure on create
    Given the user is logged in with test credentials
