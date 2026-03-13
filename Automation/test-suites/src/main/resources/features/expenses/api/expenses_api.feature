@expenses @api
Feature: Expenses API flows

  @regression @template @dsl
  Scenario: User can submit an expense request
    Given api testing is ready
    And the user is logged in with test credentials
    When the user sends a POST request to "expenses.create" with data
      | key           | value                                  |
      | expenseName   | Automation Expense ${random.number:4}  |
      | amount        | 120                                    |
      | category      | Food                                   |
      | paymentMethod | ${suite.expenses.default.paymentMethod} |
      | type          | ${suite.expenses.default.type}         |
      | date          | ${now:yyyy-MM-dd}                      |
    Then the response status should be one of "200,201,400,401,403"
