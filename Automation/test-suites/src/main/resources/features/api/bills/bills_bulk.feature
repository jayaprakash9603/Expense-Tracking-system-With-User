@bills @api @regression @bulk
Feature: Bill Service Bulk Operations API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Bulk add bills with tracked progress
    Given request body "bulkPayload" is loaded from payload file "payloads/bill-service/create_bill.json"
    When the user sends a POST request to "bills.bulk-add" using request body "bulkPayload"
    Then the request should succeed
