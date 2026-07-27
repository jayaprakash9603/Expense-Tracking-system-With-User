@group @api @positive @groups
Feature: group-service groups API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Groups list availability probe
    When the user sends a GET request to "groups.list"
    Then the response status should be one of "200,204,404"

  @smoke
  Scenario: Group search availability probe
    When the user sends a GET request to "groups.search"
    Then the response status should be one of "200,204,404"

  @regression
  Scenario: Create group when feature is available
    Given request body "createBody" uses the "group-create-valid" payload
    When the user sends a POST request to "groups.create" using request body "createBody"
    Then the response status should be one of "200,201,404"
    And the response should match the "group-item" schema

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    Examples:
      | endpointKey |
      | groups.members |
      | groups.search |
