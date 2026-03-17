@settings @api @regression
Feature: User Settings API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke
  Scenario: Get user settings
    When the user sends a GET request to "settings.get"
    Then the request should succeed

  Scenario: Update user settings
    Given request body "settingsPayload" is defined as
      | field    | value |
      | currency | USD   |
      | locale   | en-US |
    When the user sends a PUT request to "settings.update" using request body "settingsPayload"
    Then the request should succeed
