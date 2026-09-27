@analytics @api @negative @analytics
Feature: analytics-service analytics API negative scenarios

  Background:
    Given api testing is ready

  @negative @auth
  Scenario: Unauthorized request is rejected
    When the user sends a GET request to "analytics.overview"
    Then the response status should be one of "401,403,405"

  @negative @auth
  Scenario: Authenticated validation failure on create
    Given the user is logged in with test credentials
    Given request body "invalidBody" uses the "analytics-entity-invalid.json" payload
    When the user sends a POST request to "analytics.entity" using request body "invalidBody"
    Then the response status should be one of "400,422,500"
    And the response should match the "analytics-error" schema
