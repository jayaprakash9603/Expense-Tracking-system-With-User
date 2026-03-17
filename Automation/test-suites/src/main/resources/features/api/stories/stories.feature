@stories @api @regression
Feature: Story Service API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: List stories
    When the user sends a GET request to "stories.list"
    Then the request should succeed

  Scenario: Create a story
    Given request body "storyPayload" is defined as
      | field   | value                           |
      | title   | Auto Story ${random.number:4}   |
      | content | Automation test story content   |
      | type    | text                            |
    When the user sends a POST request to "stories.create" using request body "storyPayload"
    Then the request should succeed
    And the response field "id" should be present
    And store response field "id" as "storyId"

  Scenario: Get story by ID
    Given request body "storyPayload" is defined as
      | field   | value                            |
      | title   | Fetch Story ${random.number:4}   |
      | content | Story for fetch test             |
      | type    | text                             |
    When the user sends a POST request to "stories.create" using request body "storyPayload"
    Then the request should succeed
    And store response field "id" as "storyId"
    When the user sends a GET request to "stories.by-id" with data
      | field   | value       |
      | path.id | ${storyId}  |
    Then the response status should be 200

  Scenario: Delete a story
    Given request body "storyPayload" is defined as
      | field   | value                             |
      | title   | Delete Story ${random.number:4}   |
      | content | Story for delete test             |
      | type    | text                              |
    When the user sends a POST request to "stories.create" using request body "storyPayload"
    Then the request should succeed
    And store response field "id" as "storyId"
    When the user sends a DELETE request to "stories.delete" with data
      | field   | value       |
      | path.id | ${storyId}  |
    Then the response status should be 200
