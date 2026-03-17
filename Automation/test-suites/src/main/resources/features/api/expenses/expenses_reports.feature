@expenses @api @regression @reports
Feature: Expense Reports and Cashflow API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Get expense summary
    When the user sends a GET request to "expenses.summary"
    Then the request should succeed

  Scenario: Get payment method summary
    When the user sends a GET request to "expenses.payment-summary"
    Then the request should succeed

  Scenario: Get monthly summary
    When the user sends a GET request to "expenses.monthly-summary" with data
      | field      | value |
      | path.year  | 2025  |
      | path.month | 1     |
    Then the request should succeed

  Scenario: Get yearly summary
    When the user sends a GET request to "expenses.yearly-summary" with data
      | field     | value |
      | path.year | 2025  |
    Then the request should succeed

  Scenario: Get cashflow
    When the user sends a GET request to "expenses.cashflow"
    Then the request should succeed

  Scenario: Get gain expenses
    When the user sends a GET request to "expenses.gain"
    Then the request should succeed

  Scenario: Get loss expenses
    When the user sends a GET request to "expenses.loss"
    Then the request should succeed

  Scenario: Get report history
    When the user sends a GET request to "expenses.reports-history"
    Then the request should succeed

  Scenario: Generate Excel report
    When the user sends a GET request to "expenses.excel-report"
    Then the request should succeed
