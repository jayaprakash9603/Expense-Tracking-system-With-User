@expenses @ui @regression
Feature: Expense form validation and negative scenarios

  Background:
    Given an authenticated dashboard session is ready
    And the user is on "Expenses" page

  @negative @data-optional
  Scenario: Submit expense without required fields
    When the user clicks "expense-add-new"
    And the user clicks "expense-open-add"
    And the user clicks "expense-submit"
    Then "auth-error" should be visible on the page

  @negative @data-optional
  Scenario: Submit expense with zero amount
    When the user clicks "expense-add-new"
    And the user clicks "expense-open-add"
    And the user fills the form with data
      | field            | value                          |
      | expense-name     | Zero Amount ${random.number:4} |
      | expense-amount   | 0                              |
    And the user clicks "expense-submit"
    Then "auth-error" should be visible on the page

  @negative @data-optional
  Scenario: Submit expense with negative amount
    When the user clicks "expense-add-new"
    And the user clicks "expense-open-add"
    And the user fills the form with data
      | field            | value                               |
      | expense-name     | Negative Amount ${random.number:4}  |
      | expense-amount   | -50                                 |
    And the user clicks "expense-submit"
    Then "auth-error" should be visible on the page

  @data-optional
  Scenario: Cancel adding an expense returns to list
    When the user clicks "expense-add-new"
    And the user clicks "expense-open-add"
    And the user fills the form with data
      | field            | value                             |
      | expense-name     | Cancel Test ${random.number:4}    |
      | expense-amount   | 100                               |
    When the user clicks "modal-cancel"
    Then the current URL should contain "/expenses"

  @data-optional
  Scenario: Cancel delete modal keeps the expense
    When the user adds an expense with details
      | key              | value                             |
      | expenseName      | Keep Expense ${random.number:4}   |
      | amount           | 100                               |
      | transactionType  | Gain                              |
      | comments         | Cancel delete test                |
      | category         | Others                            |
      | paymentMethod    | Credit Paid                       |
    Then the added expense should be visible
    When the user clicks "expense-delete"
    And the user cancels the modal
    Then the current URL should contain "/expenses"
