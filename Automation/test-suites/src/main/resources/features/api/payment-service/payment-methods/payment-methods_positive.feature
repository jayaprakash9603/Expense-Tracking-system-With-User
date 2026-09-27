@payment @api @positive @payment-methods
Feature: payment-service payment-methods API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Create resource via payments.create
    Given request body "createBody" uses the "payment-create-valid" payload
    When the user sends a POST request to "payments.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And the response should match the "payment-item" schema
    And the response should pass validation rules for "payment-service" "create_payment"
    And store response field "id" as "payment.id"

  @smoke
  Scenario: Retrieve resource by id via payments.by-id
    Given request body "createBody" uses the "payment-create-valid" payload
    When the user sends a POST request to "payments.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And store response field "id" as "payment.id"
    When the user sends a GET request to "payments.by-id" with data
      | key           | value              |
      | path.id     | ${payment.id}     |
    Then the response status should be one of "200,404"
    And the response should match the "payment-item" schema

  @smoke
  Scenario: List resources via payments.list
    When the user sends a GET request to "payments.list"
    Then the response status should be one of "200,204"
    And the response should match the "payment-list" schema

  Scenario: Update resource
    Given request body "createBody" uses the "payment-create-valid" payload
    When the user sends a POST request to "payments.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And store response field "id" as "payment.id"
    When the user sends a PUT request to "payments.update" using request body "createBody" with data
      | key           | value              |
      | path.id | ${payment.id} |
    Then the response status should be one of "200,404"

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    And the response should match the "payment-list" schema
    Examples:
      | endpointKey |
      | payments.by-name |
      | payments.by-name-and-type |
      | payments.unused |
      | payments.search |
      | payments.names |
