@analytics @api @positive @analytics
Feature: analytics-service analytics API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Entity analytics via analytics.entity
    Given request body "createBody" uses the "analytics-entity-valid" payload
    When the user sends a POST request to "analytics.entity" using request body "createBody"
    Then the response status should be one of "200,201"
    And the response should match the "analytics-item" schema
    And the response should pass validation rules for "analytics-service" "entity_analytics"

  @smoke
  Scenario: Analytics overview returns data
    When the user sends a GET request to "analytics.overview"
    Then the response status should be one of "200,204"
    And the response should match the "analytics-item" schema
    And the response should pass validation rules for "analytics-service" "overview"

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    And the response should match the "analytics-item" schema
    Examples:
      | endpointKey |
      | analytics.report-excel |
