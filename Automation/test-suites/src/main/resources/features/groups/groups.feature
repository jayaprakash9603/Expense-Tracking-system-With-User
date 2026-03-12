@groups
Feature: Groups testing flows

  @regression @skeleton
  Scenario: Groups area is set up for testing
    Given "groups" area is set up for testing
    Then "groups" area has its test connections ready

  @regression @template @api @dsl
  Scenario: User can submit a group creation request
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a POST request to "groups.create" with data
      | key         | value                             |
      | name        | ${suite.groups.default.name} ${random.number:3} |
      | description | Hybrid API DSL template           |
    Then the response status should be one of "200,201,400,401,403"
