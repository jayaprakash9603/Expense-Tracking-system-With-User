@analytics @api @regression
Feature: Analytics Service API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Get analytics overview
    When the user sends a GET request to "analytics.overview"
    Then the request should succeed

  Scenario: Get entity analytics
    Given request body "entityPayload" is defined as
      | field      | value    |
      | entityType | expense  |
    When the user sends a POST request to "analytics.entity" using request body "entityPayload"
    Then the request should succeed

  Scenario: Generate analytics Excel report
    When the user sends a GET request to "analytics.report-excel"
    Then the request should succeed
