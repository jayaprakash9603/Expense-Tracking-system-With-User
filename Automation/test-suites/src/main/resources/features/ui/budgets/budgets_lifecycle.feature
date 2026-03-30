@budgets @ui @lifecycle @scenarioid
Feature: Budget lifecycle with scenarioID tracking
  Full CRUD lifecycle for budgets using ID-based context management.

  @smoke @requiresCredentials
  Scenario: Create, verify, and manage budget with scenarioID tracking

    # ── Browser Setup + Authentication ──
    Given a browser is launched and navigated to base URL for scenario "ManageBudget_SMOKE-01"
    And I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "ManageBudget_SMOKE-01"
    Then the user should be on "Dashboard" page for scenarioID "ManageBudget_SMOKE-01"

    # ── Navigate to Budgets ──
    When the user navigates to "Budgets" page for scenarioID "ManageBudget_SMOKE-01"
    Then the user should be on "budgets" page for scenarioID "ManageBudget_SMOKE-01"

    # ── Create Budget ──
    When the user fills the form with data for scenarioID "ManageBudget_SMOKE-01"
      | key         | value                             |
      | budgetName  | Lifecycle Budget ${random.number:5} |
      | amount      | 5000.00                           |
      | period      | monthly                           |
      | category    | Others                            |
    And the user clicks "submit" for scenarioID "ManageBudget_SMOKE-01"
    Then "successMessage" should be visible for scenarioID "ManageBudget_SMOKE-01"

    # ── Verify Budget ──
    And I want to wait for 2 seconds for scenarioID "ManageBudget_SMOKE-01"
    Then "budgetListTable" should be visible for scenarioID "ManageBudget_SMOKE-01"

    # ── Edit Budget ──
    When the user fills the form with data for scenarioID "ManageBudget_SMOKE-01"
      | key         | value                                |
      | budgetName  | Updated Budget ${random.number:5}    |
      | amount      | 10000.00                             |
    And the user clicks "submit" for scenarioID "ManageBudget_SMOKE-01"
    Then "successMessage" should be visible for scenarioID "ManageBudget_SMOKE-01"

    # ── Cleanup ──
    Then the browser is closed for scenario "ManageBudget_SMOKE-01"
