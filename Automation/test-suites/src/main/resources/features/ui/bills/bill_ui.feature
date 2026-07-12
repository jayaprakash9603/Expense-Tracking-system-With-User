@bills @ui @regression
Feature: Bill UI Operations

  Background:
    Given an authenticated dashboard session is ready

  @smoke
  Scenario: Create a new bill
    When the user opens the "bill" page
    And the user clicks "bill.create.new"
    And the user fills the form with data
      | field       | value                       |
      | billName    | Test Bill ${random.number:4}|
      | description | Auto-generated test bill    |
      | type        | purchase                    |
    And the user clicks "bill.submit"
    Then "bill.success.toast" should be visible on the page

  Scenario: View bill list
    When the user opens the "bill" page
    Then the "Bill" tab page should be opened

  Scenario: Edit a bill
    When the user adds a bill with details
      | field       | value                        |
      | billName    | Edit Bill ${random.number:4} |
      | description | Bill for edit test           |
    Then the added bill should be visible
    When the user edits the bill with details
      | field       | value             |
      | billName    | Updated Bill Name |
    Then the edited bill should be visible

  Scenario: Delete a bill
    When the user adds a bill with details
      | field       | value                          |
      | billName    | Delete Bill ${random.number:4} |
      | description | Bill for delete test           |
    Then the added bill should be visible
    When the user deletes the current bill
    Then the bill should be removed from the list
