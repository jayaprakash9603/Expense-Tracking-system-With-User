@dashboard @navigation @ui @regression
Feature: Cross-domain navigation from dashboard

  Background:
    Given an authenticated dashboard session is ready
    Then the user should be on "Dashboard" page

  @smoke @data-optional
  Scenario Outline: Navigate from dashboard to <domain> and back
    When the user opens the "<domain>" page
    Then the current URL should contain "<expectedPath>"
    When the user redirects to the "Home" tab
    Then the "Home" tab page should be opened

    Examples:
      | domain         | expectedPath    |
      | expenses       | /expenses       |
      | budgets        | /budget         |
      | bills          | /bill           |
      | categories     | /category-flow  |
      | friends        | /friends        |
      | groups         | /groups         |

  @data-optional
  Scenario: Full cross-domain navigation flow
    When the user opens the "expenses" page
    Then the current URL should contain "/expenses"
    When the user opens the "budgets" page
    Then the current URL should contain "/budget"
    When the user opens the "bills" page
    Then the current URL should contain "/bill"
    When the user opens the "categories" page
    Then the current URL should contain "/category-flow"
    When the user redirects to the "Home" tab
    Then the "Home" tab page should be opened

  @data-optional
  Scenario: Create expense then navigate to budgets
    When the user opens the "expenses" page
    And the user clicks "expense-add-new"
    And the user clicks "expense-open-add"
    And the user fills the form with data
      | field            | value                               |
      | expense-name     | Cross-Nav Test ${random.number:4}   |
      | expense-amount   | 50                                  |
    And the user clicks "expense-submit"
    Then the toast message should contain "created"
    When the user opens the "budgets" page
    Then the current URL should contain "/budget"

  @data-optional
  Scenario: Navigate using sidebar tabs
    When the user redirects to the "Expenses" tab
    Then the "Expenses" tab page should be opened
    When the user redirects to the "Friends" tab
    Then the "Friends" tab page should be opened
    When the user redirects to the "Budgets" tab
    Then the "Budgets" tab page should be opened
    When the user redirects to the "Settings" tab
    Then the "Settings" tab page should be opened

  @data-optional
  Scenario Outline: ScenarioID-based cross-domain navigation
    Given I want to setup a browser for UI testing for scenarioID "<scenarioId>"
    And I want to login to the UI with username "${test.user.email}" and password "${test.user.password}" for scenarioID "<scenarioId>"
    When the user opens the "<domain>" page for scenarioID "<scenarioId>"
    Then the current URL should contain "<expectedPath>" for scenarioID "<scenarioId>"

    Examples:
      | scenarioId              | domain    | expectedPath |
      | CrossNav_Expenses_01    | expenses  | /expenses    |
      | CrossNav_Budgets_01     | budgets   | /budget      |
      | CrossNav_Bills_01       | bills     | /bill        |
