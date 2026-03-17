@auth @ui @regression
Feature: Forgot Password UI Flow

  Scenario: Navigate to forgot password page
    Given ui testing is ready
    When the user is on "Login" page
    And the user clicks "auth.forgot.password.link"
    Then the "Forgot Password" tab page should be opened

  Scenario: Send OTP for password reset
    Given ui testing is ready
    When the user is on "Forgot Password" page
    And the user fills the form with data
      | field | value                      |
      | email | ${suite.auth.test.email}   |
    And the user clicks "auth.send.otp"
    Then "auth.otp.sent.message" should be visible on the page
