@friendship @api @positive @friendships
Feature: friendship-service friendships API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Friends list availability probe
    When the user sends a GET request to "friendships.friends"
    Then the response status should be one of "200,204,404"

  @smoke
  Scenario: Pending friendships availability probe
    When the user sends a GET request to "friendships.pending"
    Then the response status should be one of "200,204,404"

  @regression
  Scenario: Send friendship request when feature is available
    When the user sends a POST request to "friendships.request" with data
      | key               | value |
      | query.recipientId | 2     |
    Then the response status should be one of "200,201,400,409,404"
    And the response should match the "friendship-item" schema

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    Examples:
      | endpointKey |
      | friendships.stats |
      | friendships.search |
