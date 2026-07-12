@navigation @ui @regression
Feature: User/Admin Mode Switching

  Background:
    Given an authenticated dashboard session is ready

  Scenario: Switch to admin mode
    When the user clicks "mode.switch.admin"
    Then the "Admin Dashboard" tab page should be opened

  Scenario: Switch back to user mode
    When the user clicks "mode.switch.admin"
    Then the "Admin Dashboard" tab page should be opened
    When the user clicks "mode.switch.user"
    Then the "Dashboard" tab page should be opened
