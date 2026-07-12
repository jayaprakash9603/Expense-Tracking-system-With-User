@navigation @ui @regression @smoke
Feature: Sidebar Navigation

  Background:
    Given an authenticated dashboard session is ready

  Scenario: Navigate to Dashboard
    When the user redirects to the "Dashboard" tab
    Then the "Dashboard" tab page should be opened

  Scenario: Navigate to Expenses
    When the user redirects to the "Expenses" tab
    Then the "Expenses" tab page should be opened

  Scenario: Navigate to Categories
    When the user redirects to the "Categories" tab
    Then the "Categories" tab page should be opened

  Scenario: Navigate to Payments
    When the user redirects to the "Payments" tab
    Then the "Payments" tab page should be opened

  Scenario: Navigate to Bills
    When the user redirects to the "Bill" tab
    Then the "Bill" tab page should be opened

  Scenario: Navigate to Friends
    When the user redirects to the "Friends" tab
    Then the "Friends" tab page should be opened

  Scenario: Navigate to Groups
    When the user redirects to the "Groups" tab
    Then the "Groups" tab page should be opened

  Scenario: Navigate to Budgets
    When the user redirects to the "Budgets" tab
    Then the "Budgets" tab page should be opened

  Scenario: Navigate to Reports
    When the user redirects to the "Reports" tab
    Then the "Reports" tab page should be opened

  Scenario: Navigate to Profile
    When the user redirects to the "Profile" tab
    Then the "Profile" tab page should be opened

  Scenario: Navigate to Settings
    When the user is on "Settings" page
    Then the text at "settings.title" should contain "Settings"
