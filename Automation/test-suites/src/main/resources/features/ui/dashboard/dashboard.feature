@dashboard
Feature: Dashboard testing flows

  Background:
    Given an authenticated dashboard session is ready
    Then the user should be on "Dashboard" page

  @regression @ui @dsl @data-optional
  Scenario: Dashboard page is displayed 
    Given the user is on "Dashboard" page
    Then the user should be on "Dashboard" page

  @regression @ui @dsl @data-optional
  Scenario Outline: User mode tab redirect works by label
    Given the user is on "Dashboard" page
    When the user redirects to the "<tabLabel>" tab
    Then the "<tabLabel>" tab page should be opened

    Examples:
      | tabLabel   |
      | Home       |
      | Expenses   |
      | Utilities  |

  @regression @ui @dsl @data-optional @adminModeOnly
  Scenario Outline: Admin mode tab redirect works by label
    Given the user is on "Dashboard" page
    When the user redirects to the "<tabLabel>" tab
    Then the "<tabLabel>" tab page should be opened

    Examples:
      | tabLabel         |
      | Admin Dashboard  |
      | User Management  |
      | Admin Reports    |

  @ui @regression @data-optional
  Scenario: User can navigate to selected user tabs after login
    When the user redirects to the "Expenses" tab
    Then the "Expenses" tab page should be opened
    When the user redirects to the "Friends" tab
    Then the "Friends" tab page should be opened
    When the user redirects to the "Utilities" tab
    Then the "Utilities" tab page should be opened

  @ui @regression @data-optional
  Scenario: User can navigate to more user tabs after login
    When the user redirects to the "Groups" tab
    Then the "Groups" tab page should be opened
    When the user redirects to the "Budgets" tab
    Then the "Budgets" tab page should be opened
