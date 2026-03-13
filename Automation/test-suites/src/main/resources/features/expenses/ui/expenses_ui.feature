@expenses @ui
Feature: Expenses UI flows

  Background:
    Given an authenticated dashboard session is ready
    Given the user is on "Expenses" page
    Then the user should be on "Expenses" page

  @regression @dsl @data-optional
  Scenario: User can add an expense
    When the user adds an expense with details
      | key           | value                                 |
      | expenseName   | UI Expense ${random.number:5}         |
      | amount        | 120                                   |
      | comments      | UI add flow                           |
      | category      | Others                                |
      | paymentMethod | Credit Due                            |
    Then the added expense should be visible

  @regression @dsl @data-optional
  Scenario: User can edit an expense
    When the user adds an expense with details
      | key           | value                                 |
      | expenseName   | UI Expense ${random.number:5}         |
      | amount        | 120                                   |
      | comments      | UI add flow                           |
      | category      | Others                                |
      | paymentMethod | Credit Due                            |
    Then the added expense should be visible
    When the user edits the expense with details
      | key           | value                                 |
      | expenseName   | UI Expense Edit ${random.number:5}    |
      | amount        | 200                                   |
      | comments      | UI edit flow                          |
      | category      | Others                                |
      | paymentMethod | Cash                                  |
    Then the edited expense should be visible

  @regression @dsl @data-optional
  Scenario: User can delete an expense
    When the user adds an expense with details
      | key           | value                                 |
      | expenseName   | UI Expense ${random.number:5}         |
      | amount        | 120                                   |
      | comments      | UI add flow                           |
      | category      | Others                                |
      | paymentMethod | Credit Due                            |
    Then the added expense should be visible
    When the user edits the expense with details
      | key           | value                                 |
      | expenseName   | UI Expense Edit ${random.number:5}    |
      | amount        | 200                                   |
      | comments      | UI edit flow                          |
      | category      | Others                                |
      | paymentMethod | Cash                                  |
    Then the edited expense should be visible
    When the user deletes the current expense
    Then the expense should be removed from the list
