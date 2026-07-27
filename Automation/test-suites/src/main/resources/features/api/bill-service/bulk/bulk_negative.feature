@bill @api @negative @bulk
Feature: bill-service bulk API negative scenarios

  Background:
    Given api testing is ready

  @negative @auth
  Scenario: Unauthorized request is rejected
    When the user sends a GET request to "bills.bulk-add"
    Then the response status should be one of "401,403,405"

  @negative @auth
  Scenario: Authenticated validation failure on create
    Given the user is logged in with test credentials

  @negative @notfound
  Scenario: Unknown resource id returns not found
    Given the user is logged in with test credentials
    When the user sends a GET request to "bills.bulk-progress" with data
      | key        | value   |
      | path.jobId  | 999999999 |
    Then the response status should be one of "404,400,403"
