@groups @ui @regression
Feature: Groups UI Operations

  Background:
    Given an authenticated dashboard session is ready

  Scenario: View groups list
    When the user opens the "groups" page
    Then the "Groups" tab page should be opened

  Scenario: Create a new group
    When the user opens the "groups" page
    And the user clicks "groups.create.new"
    And the user fills the form with data
      | field       | value                            |
      | groupName   | Test Group ${random.number:4}    |
      | description | Auto-generated test group        |
    And the user clicks "groups.submit"
    Then "groups.success.toast" should be visible on the page
