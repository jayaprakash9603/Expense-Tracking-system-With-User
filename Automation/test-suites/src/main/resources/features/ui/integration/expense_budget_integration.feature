@integration @ui @lifecycle @scenarioid
Feature: Expense-Budget integration with scenarioID tracking
  Cross-domain integration testing: create a budget then add expenses
  that affect the budget. Uses scenarioID isolation to track both
  budget and expense contexts independently.

  @regression @requiresCredentials
  Scenario: Create budget and add expenses that track against it

    # ── Browser Setup + Authentication ──
    Given a browser is launched and navigated to base URL for scenario "BudgetExpense_INT-01"
    And I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "BudgetExpense_INT-01"
    Then the user should be on "Dashboard" page for scenarioID "BudgetExpense_INT-01"

    # ── Create Budget First ──
    When the user navigates to "Budgets" page for scenarioID "BudgetExpense_INT-01"
    And the user fills the form with data for scenarioID "BudgetExpense_INT-01"
      | key         | value                                   |
      | budgetName  | Integration Budget ${random.number:5}   |
      | amount      | 2000.00                                 |
      | period      | monthly                                 |
      | category    | Others                                  |
    And the user clicks "submit" for scenarioID "BudgetExpense_INT-01"
    Then "successMessage" should be visible for scenarioID "BudgetExpense_INT-01"
    And I want to wait for 2 seconds for scenarioID "BudgetExpense_INT-01"

    # ── Add Expense Against Budget (different scenarioID) ──
    When the user navigates to "Expenses" page for scenarioID "BudgetExpense_INT-02"
    And the user fills the form with data for scenarioID "BudgetExpense_INT-02"
      | key             | value                                  |
      | expenseName     | Integration Expense ${random.number:5} |
      | amount          | 500.00                                 |
      | transactionType | Loss                                   |
      | comments        | Linked to integration budget           |
      | category        | Others                                 |
      | paymentMethod   | Cash                                   |
    And the user clicks "submit" for scenarioID "BudgetExpense_INT-02"
    Then "successMessage" should be visible for scenarioID "BudgetExpense_INT-02"

    # ── Verify Budget Still Shows Correctly ──
    When the user navigates to "Budgets" page for scenarioID "BudgetExpense_INT-01"
    And I want to wait for 2 seconds for scenarioID "BudgetExpense_INT-01"
    Then "budgetListTable" should be visible for scenarioID "BudgetExpense_INT-01"

    # ── Cleanup ──
    Then all browsers are closed
