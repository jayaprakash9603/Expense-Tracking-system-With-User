@admin @ui @regression
Feature: Admin Panel UI Operations

  Background:
    Given an authenticated dashboard session is ready

  Scenario: View admin dashboard
    When the user opens the "admin" page
    Then the "Admin Dashboard" tab page should be opened

  Scenario: Navigate to user management
    When the user redirects to the "User Management" tab
    Then the "User Management" tab page should be opened

  Scenario: Navigate to role management
    When the user redirects to the "Role Management" tab
    Then the "Role Management" tab page should be opened

  Scenario: Navigate to system analytics
    When the user redirects to the "System Analytics" tab
    Then the "System Analytics" tab page should be opened

  Scenario: Navigate to audit logs
    When the user redirects to the "Audit Logs" tab
    Then the "Audit Logs" tab page should be opened

  Scenario: Navigate to admin reports
    When the user redirects to the "Admin Reports" tab
    Then the "Admin Reports" tab page should be opened
