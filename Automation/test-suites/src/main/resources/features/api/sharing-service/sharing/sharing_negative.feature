@sharing @api @negative @sharing
Feature: sharing-service sharing API negative scenarios

  Background:
    Given api testing is ready

  @negative @auth
  Scenario: Unauthorized request is rejected
    When the user sends a GET request to "shares.create"
    Then the response status should be one of "401,403,405"

  @negative @auth
  Scenario: Authenticated validation failure on create
    Given the user is logged in with test credentials
    Given request body "invalidBody" uses the "share-create-invalid.json" payload
    When the user sends a POST request to "shares.create" using request body "invalidBody"
    Then the response status should be one of "400,422,500"
    And the response should match the "share-error" schema

  @negative @notfound
  Scenario: Unknown resource id returns not found
    Given the user is logged in with test credentials
    When the user sends a GET request to "shares.access" with data
      | key        | value   |
      | path.token  | 999999999 |
    Then the response status should be one of "404,400,403"
