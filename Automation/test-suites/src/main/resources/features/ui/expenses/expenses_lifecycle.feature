@expenses @ui @lifecycle @scenarioid
Feature: Expense lifecycle with scenarioID tracking
  Full CRUD lifecycle for expenses using ID-based context management.
  Each step carries a scenarioID DataTable for data isolation and traceability.

  @smoke @requiresCredentials
  Scenario: Create, verify, edit, and delete an expense with scenarioID tracking

    # ── Browser Setup + Authentication ──
    Given a browser is launched and navigated to base URL for scenario "CreateExpense_SMOKE-01"
    And I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "CreateExpense_SMOKE-01"
    Then the user should be on "Dashboard" page for scenarioID "CreateExpense_SMOKE-01"

    # ── Navigate to Expenses ──
    When the user navigates to "Expenses" page for scenarioID "CreateExpense_SMOKE-01"
    Then the user should be on "expenses" page for scenarioID "CreateExpense_SMOKE-01"

    # ── Create Expense ──
    When the user fills the form with data for scenarioID "CreateExpense_SMOKE-01"
      | key             | value                           |
      | expenseName     | Lifecycle Expense ${random.number:5} |
      | amount          | 250.00                          |
      | transactionType | Loss                            |
      | comments        | Created via lifecycle test       |
      | category        | Others                          |
      | paymentMethod   | Cash                            |
    And the user clicks "submit" for scenarioID "CreateExpense_SMOKE-01"
    Then "successMessage" should be visible for scenarioID "CreateExpense_SMOKE-01"

    # ── Verify Expense ──
    And I want to wait for 2 seconds for scenarioID "CreateExpense_SMOKE-01"
    Then "expenseListTable" should be visible for scenarioID "CreateExpense_SMOKE-01"

    # ── Edit Expense (reuses created expense context) ──
    When the user fills the form with data for scenarioID "CreateExpense_SMOKE-01"
      | key             | value                              |
      | expenseName     | Updated Expense ${random.number:5} |
      | amount          | 500.00                             |
      | transactionType | Gain                               |
      | comments        | Updated via lifecycle test          |
    And the user clicks "submit" for scenarioID "CreateExpense_SMOKE-01"
    Then "successMessage" should be visible for scenarioID "CreateExpense_SMOKE-01"

    # ── Delete Expense ──
    When the user clicks "delete" for scenarioID "CreateExpense_SMOKE-01"
    And I want to wait for 2 seconds for scenarioID "CreateExpense_SMOKE-01"

    # ── Cleanup ──
    Then the browser is closed for scenario "CreateExpense_SMOKE-01"

  @regression @requiresCredentials
  Scenario: Multi-expense creation with different scenarioIDs

    # ── First expense ──
    Given a browser is launched and navigated to base URL for scenario "MultiExpense_REG-01"
    And I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "MultiExpense_REG-01"
    When the user navigates to "Expenses" page for scenarioID "MultiExpense_REG-01"
    And the user fills the form with data for scenarioID "MultiExpense_REG-01"
      | key             | value                                  |
      | expenseName     | First Expense ${random.number:5}       |
      | amount          | 100.00                                 |
      | transactionType | Loss                                   |
      | comments        | First of batch                         |
      | category        | Others                                 |
      | paymentMethod   | Cash                                   |
    And the user clicks "submit" for scenarioID "MultiExpense_REG-01"
    Then "successMessage" should be visible for scenarioID "MultiExpense_REG-01"

    # ── Second expense (same browser session, different scenarioID) ──
    When the user fills the form with data for scenarioID "MultiExpense_REG-02"
      | key             | value                                  |
      | expenseName     | Second Expense ${random.number:5}      |
      | amount          | 200.00                                 |
      | transactionType | Gain                                   |
      | comments        | Second of batch                        |
      | category        | Others                                 |
      | paymentMethod   | Credit Paid                            |
    And the user clicks "submit" for scenarioID "MultiExpense_REG-02"
    Then "successMessage" should be visible for scenarioID "MultiExpense_REG-02"

    Then all browsers are closed
