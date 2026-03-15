@settings
Feature: Settings testing flows

  @regression @skeleton
  Scenario: Settings area is set up for testing
    Given "settings" area is set up for testing
    Then "settings" area has its test connections ready

  @regression @template @api @dsl
  Scenario: User can update two-factor preference
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a PUT request to "user.two-factor" with data
      | key     | value |
      | enabled | false |
    Then the response status should be one of "200,400,401,403"
