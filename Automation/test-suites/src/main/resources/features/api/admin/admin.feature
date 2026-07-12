@admin
Feature: Admin testing flows

  @regression @skeleton
  Scenario: Admin area is set up for testing
    Given "admin" area is set up for testing
    Then "admin" area has its test connections ready

  @regression @template @api @dsl
  Scenario: User can request the admin users list
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a GET request to "admin.users.list"
    Then the response status should be one of "200,401,403"
