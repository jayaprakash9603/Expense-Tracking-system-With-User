@payments @api @regression
Feature: Payment Method Service CRUD API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke
  Scenario: Create a new payment method
    Given request body "paymentPayload" is defined as
      | field | value                             |
      | name  | Auto Pay ${random.number:4}       |
      | type  | credit_card                       |
    When the user sends a POST request to "payments.create" using request body "paymentPayload"
    Then the request should succeed
    And the response field "id" should be present
    And the response field "name" should contain "Auto Pay"
    And store response field "id" as "createdPaymentId"

  Scenario: Get payment method by ID
    Given request body "paymentPayload" is defined as
      | field | value                               |
      | name  | Fetch Pay ${random.number:4}        |
      | type  | debit_card                          |
    When the user sends a POST request to "payments.create" using request body "paymentPayload"
    Then the request should succeed
    And store response field "id" as "paymentId"
    When the user sends a GET request to "payments.by-id" with data
      | field   | value         |
      | path.id | ${paymentId}  |
    Then the response status should be 200
    And the response field "name" should contain "Fetch Pay"

  Scenario: Update a payment method
    Given request body "paymentPayload" is defined as
      | field | value                                |
      | name  | Update Pay ${random.number:4}        |
      | type  | credit_card                          |
    When the user sends a POST request to "payments.create" using request body "paymentPayload"
    Then the request should succeed
    And store response field "id" as "paymentId"
    Given request body "updatePayload" is defined as
      | field | value                  |
      | name  | Updated Payment Name   |
      | type  | bank_transfer          |
    When the user sends a PUT request to "payments.update" using request body "updatePayload" with data
      | field   | value         |
      | path.id | ${paymentId}  |
    Then the response status should be 200
    And the response field "name" should equal "Updated Payment Name"

  Scenario: Delete a payment method
    Given request body "paymentPayload" is defined as
      | field | value                                |
      | name  | Delete Pay ${random.number:4}        |
      | type  | cash                                 |
    When the user sends a POST request to "payments.create" using request body "paymentPayload"
    Then the request should succeed
    And store response field "id" as "paymentId"
    When the user sends a DELETE request to "payments.delete" with data
      | field   | value         |
      | path.id | ${paymentId}  |
    Then the response status should be 200

  Scenario: List all payment methods
    When the user sends a GET request to "payments.list"
    Then the request should succeed

  Scenario: Search payment methods
    When the user sends a GET request to "payments.search" with data
      | field       | value |
      | query.query | Auto  |
    Then the request should succeed

  Scenario: Get unused payment methods
    When the user sends a GET request to "payments.unused"
    Then the request should succeed

  Scenario: Get payment method names
    When the user sends a GET request to "payments.names"
    Then the request should succeed
