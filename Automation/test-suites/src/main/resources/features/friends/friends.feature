@friends
Feature: Friends testing flows

  @regression @skeleton
  Scenario: Friends area is set up for testing
    Given "friends" area is set up for testing
    Then "friends" area has its test connections ready

  @regression @template @api @dsl
  Scenario: User can send a friend request
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a POST request to "friendships.request" with data
      | key               | value                          |
      | query.recipientId | ${suite.friends.default.recipientId} |
    Then the response status should be one of "200,201,400,401,403,409"
