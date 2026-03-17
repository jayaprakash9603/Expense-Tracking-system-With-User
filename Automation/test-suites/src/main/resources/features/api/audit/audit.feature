@audit @api @regression
Feature: Audit Service API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Get audit logs
    When the user sends a GET request to "audit.logs"
    Then the request should succeed

  Scenario: Get audit types
    When the user sends a GET request to "audit.types"
    Then the request should succeed

  Scenario: Get admin audit logs
    When the user sends a GET request to "audit.admin-logs"
    Then the request should succeed

  Scenario: Get admin audit stats
    When the user sends a GET request to "audit.admin-stats"
    Then the request should succeed

  Scenario: Get admin reports
    When the user sends a GET request to "audit.admin-reports"
    Then the request should succeed

  Scenario: Generate admin report
    Given request body "reportPayload" is defined as
      | field      | value   |
      | reportType | summary |
    When the user sends a POST request to "audit.admin-generate-report" using request body "reportPayload"
    Then the request should succeed
