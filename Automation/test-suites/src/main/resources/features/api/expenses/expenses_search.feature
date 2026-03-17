@expenses @api @regression
Feature: Expense Search and Filter API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Search expenses
    When the user sends a GET request to "expenses.search" with data
      | field       | value |
      | query.query | Test  |
    Then the request should succeed

  Scenario: Fuzzy search expenses
    When the user sends a GET request to "expenses.fuzzy-search" with data
      | field       | value |
      | query.query | test  |
    Then the request should succeed

  Scenario: Filter expenses
    When the user sends a GET request to "expenses.filter" with data
      | field      | value |
      | query.type | loss  |
    Then the request should succeed

  Scenario: Get expenses between dates
    When the user sends a GET request to "expenses.between-dates" with data
      | field          | value              |
      | query.startDate| ${now-30d:yyyy-MM-dd} |
      | query.endDate  | ${now:yyyy-MM-dd}     |
    Then the request should succeed

  Scenario: Get top N expenses
    When the user sends a GET request to "expenses.top-n" with data
      | field   | value |
      | query.n | 5     |
    Then the request should succeed

  Scenario: Get today expenses
    When the user sends a GET request to "expenses.today"
    Then the request should succeed

  Scenario: Get current month expenses
    When the user sends a GET request to "expenses.current-month"
    Then the request should succeed

  Scenario: Get last month expenses
    When the user sends a GET request to "expenses.last-month"
    Then the request should succeed
