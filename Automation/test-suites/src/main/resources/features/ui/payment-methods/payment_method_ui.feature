@payments @ui @regression
Feature: Payment Method UI Operations

  Background:
    Given an authenticated dashboard session is ready

  @smoke
  Scenario: Create a new payment method
    When the user opens the "payments" page
    And the user clicks "payment.create.new"
    And the user fills the form with data
      | field | value                           |
      | name  | Test Pay ${random.number:4}     |
      | type  | credit_card                     |
    And the user clicks "payment.submit"
    Then "payment.success.toast" should be visible on the page

  Scenario: View payment method list
    When the user opens the "payments" page
    Then the "Payments" tab page should be opened

  Scenario: Edit a payment method
    When the user adds a payment method with details
      | field | value                            |
      | name  | Edit Pay ${random.number:4}      |
      | type  | debit_card                       |
    Then the added payment method should be visible
    When the user edits the payment method with details
      | field | value                  |
      | name  | Updated Payment Name   |
    Then the edited payment method should be visible

  Scenario: Delete a payment method
    When the user adds a payment method with details
      | field | value                             |
      | name  | Delete Pay ${random.number:4}     |
      | type  | cash                              |
    Then the added payment method should be visible
    When the user deletes the current payment method
    Then the payment method should be removed from the list
