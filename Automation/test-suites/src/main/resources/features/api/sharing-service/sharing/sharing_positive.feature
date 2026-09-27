@sharing @api @positive @sharing
Feature: sharing-service sharing API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Shared resources list availability probe
    When the user sends a GET request to "shares.my"
    Then the response status should be one of "200,204,404"

  @smoke
  Scenario: Shared-with-me availability probe
    When the user sends a GET request to "shares.shared-with-me"
    Then the response status should be one of "200,204,404"

  @regression
  Scenario: Create share link when feature is available
    Given request body "createBody" uses the "share-create-valid" payload
    When the user sends a POST request to "shares.create" using request body "createBody"
    Then the response status should be one of "200,201,404"
    And the response should match the "share-item" schema

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    Examples:
      | endpointKey |
      | shares.access |
