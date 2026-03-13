@dashboard
Feature: Dashboard testing flows

  @regression @skeleton
  Scenario: Dashboard area is set up for testing
    Given "dashboard" area is set up for testing
    Then "dashboard" area has its test connections ready

  @regression @template @ui @dsl
  Scenario: Dashboard page is displayed with generic UI steps
    Given ui testing is ready
    When the user opens the "dashboard" page
    Then the user should be on "Dashboard" page
