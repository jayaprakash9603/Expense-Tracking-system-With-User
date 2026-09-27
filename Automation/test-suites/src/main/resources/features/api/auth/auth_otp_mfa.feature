@auth @api @regression @mfa
Feature: Auth OTP and MFA API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Send OTP to registered email
    Given request body "otpPayload" is defined as
      | field | value                      |
      | email | ${suite.auth.test.email}   |
    When the user sends a POST request to "auth.send-otp" using request body "otpPayload"
    Then the request should succeed

  Scenario: Check auth method for user
    When the user sends a GET request to "auth.check-method" with data
      | field       | value                      |
      | query.email | ${suite.auth.test.email}   |
    Then the request should succeed

  Scenario: Get user profile
    When the user sends a GET request to "user.profile"
    Then the request should succeed
    And the response field "email" should be present
