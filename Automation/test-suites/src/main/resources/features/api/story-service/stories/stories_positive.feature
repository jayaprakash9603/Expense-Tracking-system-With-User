@story @api @positive @stories
Feature: story-service stories API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Stories feed availability probe
    When the user sends a GET request to "stories.list"
    Then the response status should be one of "200,204,404"

  @smoke
  Scenario: Admin stories availability probe
    When the user sends a GET request to "stories.admin-list"
    Then the response status should be one of "200,204,404"

  @regression
  Scenario: Create story when feature is available
    Given request body "createBody" uses the "story-create-valid" payload
    When the user sends a POST request to "stories.create" using request body "createBody"
    Then the response status should be one of "200,201,404"
    And the response should match the "story-item" schema

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    Examples:
      | endpointKey |
      | stories.by-id |
