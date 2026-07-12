@budgets @ui @regression
Feature: Budget UI Operations

  Background:
    Given an authenticated dashboard session is ready

  @smoke
  Scenario: Create a new budget
    When the user opens the "budget" page
    And the user clicks "budget.create.new"
    And the user fills the form with data
      | field       | value                          |
      | budgetName  | Test Budget ${random.number:4} |
      | amount      | 5000                           |
      | startDate   | ${now:yyyy-MM-dd}              |
      | endDate     | ${now+30d:yyyy-MM-dd}          |
      | description | Auto test budget               |
    And the user clicks "budget.submit"
    Then "budget.success.toast" should be visible on the page

  Scenario: View budget list
    When the user opens the "budget" page
    Then the "Budgets" tab page should be opened

  Scenario: Edit a budget
    When the user adds a budget with details
      | field       | value                          |
      | budgetName  | Edit Budget ${random.number:4} |
      | amount      | 3000                           |
      | startDate   | ${now:yyyy-MM-dd}              |
      | endDate     | ${now+30d:yyyy-MM-dd}          |
    Then the added budget should be visible
    When the user edits the budget with details
      | field       | value                |
      | budgetName  | Updated Budget Name  |
      | amount      | 7000                 |
    Then the edited budget should be visible

  Scenario: Delete a budget
    When the user adds a budget with details
      | field       | value                            |
      | budgetName  | Delete Budget ${random.number:4} |
      | amount      | 1000                             |
      | startDate   | ${now:yyyy-MM-dd}                |
      | endDate     | ${now+30d:yyyy-MM-dd}            |
    Then the added budget should be visible
    When the user deletes the current budget
    Then the budget should be removed from the list
