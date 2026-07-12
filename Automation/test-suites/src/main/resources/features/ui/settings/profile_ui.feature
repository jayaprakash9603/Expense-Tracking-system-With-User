@settings @profile @ui @regression
Feature: Profile and settings UI flows

  Background:
    Given an authenticated dashboard session is ready

  @smoke @data-optional
  Scenario: Navigate to profile page
    When the user is on "Profile" page
    Then the current URL should contain "/profile"

  @data-optional
  Scenario: View profile details
    When the user is on "Profile" page
    Then "profile-first-name" should be visible on the page
    And "profile-last-name" should be visible on the page
    And "profile-email" should be visible on the page

  @data-optional
  Scenario: Update profile first name
    When the user is on "Profile" page
    And the user fills the form with data
      | field              | value                            |
      | profile-first-name | Updated ${random.number:3}       |
    And the user clicks "profile-save"
    Then the toast message should contain "updated"

  @data-optional
  Scenario: Update profile phone number
    When the user is on "Profile" page
    And the user fills the form with data
      | field          | value        |
      | profile-phone  | 0412345678   |
    And the user clicks "profile-save"
    Then the toast message should contain "updated"

  @data-optional
  Scenario: Navigate to settings page
    When the user is on "Settings" page
    Then the current URL should contain "/settings"

  @data-optional
  Scenario: Update profile bio
    When the user is on "Profile" page
    And the user fills the form with data
      | field       | value                                 |
      | profile-bio | Automation test bio ${random.number:3}|
    And the user clicks "profile-save"
    Then the toast message should contain "updated"
