@friends @ui @regression
Feature: Friends UI Operations

  Background:
    Given an authenticated dashboard session is ready

  Scenario: View friends list
    When the user opens the "friends" page
    Then the "Friends" tab page should be opened

  Scenario: Navigate to friend activity
    When the user opens the "friends" page
    And the user clicks "friends.activity.tab"
    Then "friends.activity.section" should be visible on the page
