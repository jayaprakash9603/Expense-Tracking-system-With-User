@expenses @api @regression @bulk
Feature: Expense Bulk Operations API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Bulk add expenses
    Given request body "bulkPayload" is loaded from payload file "payloads/expense-service/create_expense.json"
    When the user sends a POST request to "expenses.bulk-add" using request body "bulkPayload"
    Then the request should succeed

  Scenario: Bulk add tracked expenses
    Given request body "bulkPayload" is loaded from payload file "payloads/expense-service/create_expense.json"
    When the user sends a POST request to "expenses.bulk-add-tracked" using request body "bulkPayload"
    Then the request should succeed
