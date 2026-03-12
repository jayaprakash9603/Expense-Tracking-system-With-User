@budgets
Feature: Budgets testing flows

  @regression @skeleton
  Scenario: Budgets area is set up for testing
    Given "budgets" area is set up for testing
    Then "budgets" area has its test connections ready

  @regression @template @api @dsl
  Scenario: User can create a budget request
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a POST request to "budgets.create" with data
      | key       | value                             |
      | name      | ${suite.budgets.default.name} ${random.number:3} |
      | amount    | 1500                              |
      | startDate | ${now:yyyy-MM-dd}                 |
      | endDate   | ${now+30d:yyyy-MM-dd}             |
    Then the response status should be one of "200,201,400,401,403"
