@auth
Feature: Authentication UI flows

  @ui @smoke @requiresCredentials @data-optional
  Scenario: User reaches dashboard after successful login
    Given the login flow is ready
    When the user logs in with test credentials
    Then the user should see the dashboard

  @ui @smoke @data-optional
  Scenario: User sees an error for invalid login
    Given the login flow is ready
    When the user tries to log in with invalid credentials
    Then the login error message should contain "Invalid Username or Password"

  @ui @regression @template @dsl
  Scenario: Dashboard page can be opened with generic UI steps
    Given ui testing is ready
    When the user opens the "dashboard" page
    Then the "dashboard" page should be displayed
