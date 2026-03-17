@bills @api @regression
Feature: Bill Service CRUD API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke
  Scenario: Create a new bill
    Given request body "billPayload" is defined as
      | field       | value                        |
      | billName    | Test Bill ${random.number:4} |
      | description | Auto-generated test bill     |
      | type        | purchase                     |
    When the user sends a POST request to "bills.create" using request body "billPayload"
    Then the request should succeed
    And the response field "id" should be present
    And the response field "billName" should contain "Test Bill"
    And store response field "id" as "createdBillId"

  Scenario: Get bill by ID
    Given request body "billPayload" is defined as
      | field       | value                        |
      | billName    | Fetch Bill ${random.number:4}|
      | description | Bill for fetch test          |
      | type        | purchase                     |
    When the user sends a POST request to "bills.create" using request body "billPayload"
    Then the request should succeed
    And store response field "id" as "billId"
    When the user sends a GET request to "bills.by-id" with data
      | field   | value       |
      | path.id | ${billId}   |
    Then the response status should be 200
    And the response field "billName" should contain "Fetch Bill"

  Scenario: Update a bill
    Given request body "billPayload" is defined as
      | field       | value                           |
      | billName    | Update Bill ${random.number:4}  |
      | description | Bill for update test            |
      | type        | purchase                        |
    When the user sends a POST request to "bills.create" using request body "billPayload"
    Then the request should succeed
    And store response field "id" as "billId"
    Given request body "updatePayload" is defined as
      | field       | value            |
      | billName    | Updated Bill Name|
      | description | Updated desc     |
    When the user sends a PUT request to "bills.update" using request body "updatePayload" with data
      | field   | value     |
      | path.id | ${billId} |
    Then the response status should be 200
    And the response field "billName" should equal "Updated Bill Name"

  Scenario: Delete a bill
    Given request body "billPayload" is defined as
      | field       | value                           |
      | billName    | Delete Bill ${random.number:4}  |
      | description | Bill for delete test            |
      | type        | purchase                        |
    When the user sends a POST request to "bills.create" using request body "billPayload"
    Then the request should succeed
    And store response field "id" as "billId"
    When the user sends a DELETE request to "bills.delete" with data
      | field   | value     |
      | path.id | ${billId} |
    Then the response status should be 200

  Scenario: List all bills
    When the user sends a GET request to "bills.list"
    Then the request should succeed

  Scenario: Search bills
    When the user sends a GET request to "bills.search" with data
      | field       | value    |
      | query.query | Test     |
    Then the request should succeed
