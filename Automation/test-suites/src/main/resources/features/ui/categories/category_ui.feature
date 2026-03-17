@categories @ui @regression
Feature: Category UI Operations

  Background:
    Given an authenticated dashboard session is ready

  @smoke
  Scenario: Create a new category
    When the user opens the "categories" page
    And the user clicks "category.create.new"
    And the user fills the form with data
      | field        | value                          |
      | categoryName | Test Cat ${random.number:4}    |
      | description  | Auto-generated test category   |
      | type         | expense                        |
    And the user clicks "category.submit"
    Then "category.success.toast" should be visible on the page

  Scenario: View category list
    When the user opens the "categories" page
    Then the "Categories" tab page should be opened

  Scenario: Edit a category
    When the user adds a category with details
      | field        | value                         |
      | categoryName | Edit Cat ${random.number:4}   |
      | description  | Category for edit test        |
      | type         | expense                       |
    Then the added category should be visible
    When the user edits the category with details
      | field        | value                |
      | categoryName | Updated Category     |
    Then the edited category should be visible

  Scenario: Delete a category
    When the user adds a category with details
      | field        | value                           |
      | categoryName | Delete Cat ${random.number:4}   |
      | description  | Category for delete test        |
      | type         | expense                         |
    Then the added category should be visible
    When the user deletes the current category
    Then the category should be removed from the list
