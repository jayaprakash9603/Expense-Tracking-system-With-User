@sharing
Feature: Sharing testing flows

  @regression @skeleton
  Scenario: Sharing area is set up for testing
    Given "sharing" area is set up for testing
    Then "sharing" area has its test connections ready

  @regression @template @api @dsl
  Scenario: User can request their shared resources
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a GET request to "shares.my"
    Then the response status should be one of "200,401,403"
