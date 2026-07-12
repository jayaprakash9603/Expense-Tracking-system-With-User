@template @dsl @regression @ui
Feature: Generic CRUD operations across domains

  Background:
    Given an authenticated dashboard session is ready

  @smoke @data-optional
  Scenario Outline: Create a <domain> entity with valid data
    When the user opens the "<domain>" page
    And the user clicks "<domain>-create-new"
    And the user fills the form with data
      | field       | value                                   |
      | name        | Test <domainLabel> ${random.number:4}   |
      | description | Auto-generated <domainLabel>            |
    And the user clicks "<domain>-submit"
    Then the toast message should contain "created successfully"

    Examples:
      | domain         | domainLabel    |
      | bills          | bill           |
      | categories     | category       |
      | payment-method | payment method |
      | budgets        | budget         |

  @data-optional
  Scenario Outline: Navigate to <domain> page and verify URL
    When the user opens the "<domain>" page
    Then the current URL should contain "<expectedPath>"

    Examples:
      | domain         | expectedPath   |
      | bills          | /bill          |
      | categories     | /category-flow |
      | payment-method | /payment-method|
      | budgets        | /budget        |
      | expenses       | /expenses      |

  @data-optional
  Scenario Outline: Delete a <domain> entity with modal confirmation
    When the user opens the "<domain>" page
    And the user clicks "<domain>-create-new"
    And the user fills the form with data
      | field       | value                                   |
      | name        | Delete <domainLabel> ${random.number:4} |
      | description | Created for delete test                 |
    And the user clicks "<domain>-submit"
    Then the toast message should contain "created successfully"
    When the user clicks "<domain>-delete"
    And the user confirms the modal
    Then the toast message should contain "deleted successfully"

    Examples:
      | domain         | domainLabel    |
      | bills          | bill           |
      | categories     | category       |
      | payment-method | payment method |

  @data-optional
  Scenario: Create entity using multi-field DataTable
    When the user opens the "bills" page
    And the user clicks "bill-create-new"
    And the user fills the form with data
      | field       | value                              |
      | bill-name   | DataTable Bill ${random.number:4}  |
      | bill-amount | 250                                |
    And the user selects "Subscription" from "bill-type" dropdown
    And the user clicks "bill-submit"
    Then the toast message should contain "created successfully"

  @data-optional
  Scenario: Search for an entity by name
    When the user opens the "expenses" page
    And the user searches for "Expense"
    Then "expense-page-anchor" should be visible on the page
