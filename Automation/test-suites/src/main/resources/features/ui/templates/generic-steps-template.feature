@ui @generic @template @data-optional
Feature: Generic dual-engine UI step template
  # Living documentation for all 42 generic steps.
  # Works with both Selenium and Playwright via AUTOMATION_ENGINE.
  # Replace scenario IDs and values for your domain flows.

  Background:
    Given I want to setup a browser for UI testing for scenarioID "GenericSteps_DEMO-01"

  @smoke
  Scenario: Navigation generic steps for scenario ID GenericSteps_DEMO-01
    When I navigate to URL "/login" for scenario ID "GenericSteps_DEMO-01"
    And I wait for page to be fully loaded for scenario ID "GenericSteps_DEMO-01"
    Then I verify page URL contains "/login" for scenario ID "GenericSteps_DEMO-01"
    When I reload page for scenario ID "GenericSteps_DEMO-01"
    And I navigate back for scenario ID "GenericSteps_DEMO-01"
    And I navigate forward for scenario ID "GenericSteps_DEMO-01"

  @smoke
  Scenario: Login page interactions using generic steps
    When I navigate to URL "/login" for scenario ID "GenericSteps_DEMO-01"
    And I wait for page to be fully loaded for scenario ID "GenericSteps_DEMO-01"
    When I fill text field with name "email" with value "${test.username}" for scenario ID "GenericSteps_DEMO-01"
    And I fill text field with name "password" with value "${test.password}" for scenario ID "GenericSteps_DEMO-01"
    And I click button "Login" for scenario ID "GenericSteps_DEMO-01"
    Then I verify page URL contains "/dashboard" for scenario ID "GenericSteps_DEMO-01"

  @regression
  Scenario: Form and assertion generic steps on expense create page
    Given I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "GenericSteps_DEMO-01"
    When I navigate to URL "/expenses/create" for scenario ID "GenericSteps_DEMO-01"
    And I wait for page to be fully loaded for scenario ID "GenericSteps_DEMO-01"
    When I fill text field "login-email" with value "Coffee" for scenario ID "GenericSteps_DEMO-01"
    And I fill text field with selector "#amount" with value "25.50" for scenario ID "GenericSteps_DEMO-01"
    And I fill textarea "comments" with value "Generic step test" for scenario ID "GenericSteps_DEMO-01"
    And I populate form fields for scenario ID "GenericSteps_DEMO-01":
      | key    | value        |
      | amount | 30           |
    And I click element with selector "#amount" for scenario ID "GenericSteps_DEMO-01"
    And I press key "TAB" on element "#amount" for scenario ID "GenericSteps_DEMO-01"
    Then I verify element "#amount" is visible for scenario ID "GenericSteps_DEMO-01"
    And I verify element "#amount" exists for scenario ID "GenericSteps_DEMO-01"
    And I verify element "Submit" is visible within 10000 milliseconds for scenario ID "GenericSteps_DEMO-01"
    When I click button "Submit" for scenario ID "GenericSteps_DEMO-01"

  @regression
  Scenario: Navigation and link generic steps
    Given I want to login to the UI with username "${test.username}" and password "${test.password}" for scenarioID "GenericSteps_DEMO-01"
    When I navigate to URL "/dashboard" for scenario ID "GenericSteps_DEMO-01"
    And I click link "Expenses" for scenario ID "GenericSteps_DEMO-01"
    Then I verify page URL contains "/expenses" for scenario ID "GenericSteps_DEMO-01"
    And I verify page title contains "Expense" for scenario ID "GenericSteps_DEMO-01"
