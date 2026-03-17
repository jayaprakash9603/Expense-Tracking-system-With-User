@auth @ui @regression
Feature: Login validation and error scenarios

  @negative @data-optional
  Scenario: Empty form submission shows validation errors
    Given ui testing is ready
    And the user is on "Login" page
    When the user clicks "login-submit"
    Then "auth-error" should be visible on the page

  @negative @data-optional
  Scenario: Invalid email format shows error
    Given ui testing is ready
    And the user is on "Login" page
    When the user fills the form with data
      | field          | value            |
      | login-email    | not-an-email     |
      | login-password | SomePassword1!   |
    And the user clicks "login-submit"
    Then "auth-error" should be visible on the page

  @negative @data-optional
  Scenario: Wrong password shows authentication error
    Given ui testing is ready
    And the user is on "Login" page
    When the user fills the form with data
      | field          | value                |
      | login-email    | testuser@example.com |
      | login-password | WrongPassword123!    |
    And the user clicks "login-submit"
    Then the text at "login-error" should contain "Invalid"

  @negative @data-optional
  Scenario Outline: Login with missing <field> shows error
    Given ui testing is ready
    And the user is on "Login" page
    When the user fills "<fieldKey>" with "<value>"
    And the user clicks "login-submit"
    Then "auth-error" should be visible on the page

    Examples:
      | field    | fieldKey       | value                |
      | email    | login-email    | testuser@example.com |
      | password | login-password | SomePassword1!       |

  @smoke @data-optional
  Scenario: Successful login redirects to dashboard
    Given ui testing is ready
    And the user is on "Login" page
    When the user fills the form with data
      | field          | value                  |
      | login-email    | ${test.user.email}     |
      | login-password | ${test.user.password}  |
    And the user clicks "login-submit"
    Then the current URL should contain "/dashboard"

  @regression @data-optional
  Scenario: Forgot password link navigates to reset page
    Given ui testing is ready
    And the user is on "Login" page
    When the user clicks "Forgot Password?"
    Then the current URL should contain "/forgot"
