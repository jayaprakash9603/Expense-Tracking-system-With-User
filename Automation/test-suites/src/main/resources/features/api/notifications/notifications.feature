@notifications @api @regression
Feature: Notification Service API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: List all notifications
    When the user sends a GET request to "notifications.list"
    Then the request should succeed

  Scenario: Get unread notifications
    When the user sends a GET request to "notifications.unread"
    Then the request should succeed

  Scenario: Get notification preferences
    When the user sends a GET request to "notifications.preferences"
    Then the request should succeed

  Scenario: Update notification preferences
    Given request body "prefsPayload" is defined as
      | field              | value |
      | emailNotifications | true  |
      | pushNotifications  | true  |
    When the user sends a PUT request to "notifications.update-preferences" using request body "prefsPayload"
    Then the request should succeed
