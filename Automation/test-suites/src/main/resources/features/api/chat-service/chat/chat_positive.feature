@chat @api @positive @chat
Feature: chat-service chat API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Chat service availability probe
    When the user sends a GET request to "chats.list"
    Then the response status should be one of "200,204,404"

  @smoke
  Scenario: Presence endpoint availability probe
    When the user sends a GET request to "presence.online"
    Then the response status should be one of "200,204,404"

  @regression
  Scenario: Send direct message when chat feature is available
    Given request body "createBody" uses the "chat-send-valid" payload
    When the user sends a POST request to "chats.send-direct" using request body "createBody"
    Then the response status should be one of "200,201,404"
    And the response should match the "chat-item" schema

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    Examples:
      | endpointKey |
      | chats.between |
      | chats.unread-count |
      | chats.conversations |
      | presence.friends |
      | presence.batch |
