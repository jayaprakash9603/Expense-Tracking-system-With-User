@notification @api @positive @notifications
Feature: notification-service notifications API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke
  Scenario: List notifications
    When the user sends a GET request to "notifications.list"
    Then the response status should be one of "200,204"
    And the response should match the "notification-list" schema
    And the response should pass validation rules for "notification-service" "list_notifications"

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    And the response should match the "notification-list" schema
    Examples:
      | endpointKey |
      | notifications.unread |
      | notifications.preferences |
