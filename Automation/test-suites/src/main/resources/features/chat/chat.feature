@chat
Feature: Chat testing flows

  @regression @skeleton
  Scenario: Chat area is set up for testing
    Given "chat" area is set up for testing
    Then "chat" area has its test connections ready

  @regression @template @api @dsl
  Scenario: User can request unread chat count
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a GET request to "chats.unread-count"
    Then the response status should be one of "200,401,403"
    And the response field "unreadCount" should be present
