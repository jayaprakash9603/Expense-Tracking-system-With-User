@audit @api @positive @audit
Feature: audit-service audit API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: List audit logs
    When the user sends a GET request to "audit.logs"
    Then the response status should be one of "200,204"
    And the response should match the "audit-list" schema
    And the response should pass validation rules for "audit-service" "list_audit"

  @smoke
  Scenario: List audit types
    When the user sends a GET request to "audit.types"
    Then the response status should be one of "200,204"
    And the response should match the "audit-list" schema

  @regression
  Scenario: Generate audit report when admin API is available
    Given request body "createBody" uses the "audit-report-valid" payload
    When the user sends a POST request to "audit.admin-generate-report" using request body "createBody"
    Then the response status should be one of "200,201,404"
    And the response should match the "audit-report-item" schema

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    And the response should match the "audit-report-list" schema
    Examples:
      | endpointKey |
      | audit.admin-logs |
      | audit.admin-stats |
      | audit.admin-by-entity |
      | audit.admin-reports |
