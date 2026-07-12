@auth @api @regression
Feature: Auth Password Reset API

  Background:
    Given api testing is ready

  Scenario: Send OTP for password reset
    Given request body "otpPayload" is defined as
      | field | value                        |
      | email | ${suite.auth.test.email}     |
    When the user sends a POST request to "auth.send-otp" using request body "otpPayload"
    Then the request should succeed

  Scenario: Signin with invalid password should fail
    Given request body "signinPayload" is defined as
      | field    | value                       |
      | email    | ${suite.auth.test.email}    |
      | password | WrongPassword@123           |
    When the user sends a POST request to "auth.signin" using request body "signinPayload"
    Then the response should indicate "unauthorized"

  Scenario: Refresh token
    And the user is logged in with test credentials
    Given request body "refreshPayload" is defined as
      | field | value  |
      | jwt   | ${jwt} |
    When the user sends a POST request to "auth.refresh-token" using request body "refreshPayload"
    Then the request should succeed
    And the response field "jwt" should be present
