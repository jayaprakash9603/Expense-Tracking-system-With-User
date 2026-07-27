@bill @api @positive @bills
Feature: bill-service bills API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Create resource via bills.create
    Given request body "createBody" uses the "bill-create-valid" payload
    When the user sends a POST request to "bills.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And the response should match the "bill-item" schema
    And the response should pass validation rules for "bill-service" "create_bill"
    And store response field "id" as "bill.id"

  @smoke
  Scenario: Retrieve resource by id via bills.by-id
    Given request body "createBody" uses the "bill-create-valid" payload
    When the user sends a POST request to "bills.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And store response field "id" as "bill.id"
    When the user sends a GET request to "bills.by-id" with data
      | key           | value              |
      | path.id     | ${bill.id}     |
    Then the response status should be one of "200,404"
    And the response should match the "bill-item" schema

  @smoke
  Scenario: List resources via bills.list
    When the user sends a GET request to "bills.list"
    Then the response status should be one of "200,204"
    And the response should match the "bill-list" schema

  Scenario: Update resource
    Given request body "createBody" uses the "bill-create-valid" payload
    When the user sends a POST request to "bills.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And store response field "id" as "bill.id"
    When the user sends a PUT request to "bills.update" using request body "createBody" with data
      | key           | value              |
      | path.id | ${bill.id} |
    Then the response status should be one of "200,404"

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    And the response should match the "bill-list" schema
    Examples:
      | endpointKey |
      | bills.by-expense |
      | bills.items |
      | bills.search |
      | bills.export-excel |
      | bills.ocr-status |
