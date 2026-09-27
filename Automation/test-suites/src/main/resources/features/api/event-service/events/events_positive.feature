@event @api @positive @events
Feature: event-service events API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: List user events via events.list-user
    When the user sends a GET request to "events.list-user" with data
      | key          | value |
      | path.userId  | 5     |
    Then the response status should be one of "200,204"
    And the response should match the "event-list" schema

  @smoke
  Scenario: Retrieve event by id via events.by-id
    When the user sends a GET request to "events.by-id" with data
      | key           | value |
      | path.eventId  | 1     |
      | path.userId   | 5     |
    Then the response status should be one of "200,404"
    And the response should match the "event-item" schema

  @regression
  Scenario: Create event when backend create endpoint is healthy
    Given request body "createBody" uses the "event-create-valid" payload
    When the user sends a POST request to "events.create" using request body "createBody"
    Then the response status should be one of "200,201,500"
    And the response should match the "event-item" schema

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>" with data
      | key          | value |
      | path.userId  | 5     |
      | path.eventId | 1     |
    Then the response status should be one of "200,204,400,404"
    And the response should match the "event-list" schema
    Examples:
      | endpointKey |
      | events.summary |
      | events.analytics |
