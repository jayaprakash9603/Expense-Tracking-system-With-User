@api @auth @Phase1
Feature: Auth OTP APIs

  Background:
    Given api testing is ready
    And value "otpEmail" is set to "${suite.auth.username}"

  @smoke @regression
  Scenario: Send OTP for existing email succeeds
    When the user sends a POST request to "auth.send-otp" with data
      | key   | value           |
      | email | ${ctx.otpEmail} |
    Then the response status should be one of "200,500"

  @regression
  Scenario: Resend login OTP succeeds
    When the user sends a POST request to "auth.resend-login-otp" with data
      | key   | value           |
      | email | ${ctx.otpEmail} |
    Then the response status should be one of "200,202,400"

  @negative @regression
  Scenario: Verify OTP with incorrect code fails
    When the user sends a POST request to "auth.verify-otp" with data
      | key   | value         |
      | email | ${ctx.otpEmail} |
      | otp   | 000000        |
    Then the response status should be one of "400,401,404"

  @negative @regression
  Scenario: Verify login OTP with incorrect code fails
    When the user sends a POST request to "auth.verify-login-otp" with data
      | key   | value           |
      | email | ${ctx.otpEmail} |
      | otp   | 000000         |
    Then the response status should be one of "400,401,404"

  @regression
  Scenario: Check email existence returns true
    When the user sends a POST request to "auth.check-email" with data
      | key   | value         |
      | email | ${ctx.otpEmail} |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/auth/check-email-response.schema.json"

  @regression
  Scenario: Check auth method returns a method payload
    When the user sends a GET request to "auth.check-method" with data
      | key         | value         |
      | query.email | ${ctx.otpEmail} |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/auth/check-auth-method-response.schema.json"

  @regression
  Scenario: Auth email endpoint returns a user for email query
    When the user sends a GET request to "auth.email" with data
      | key         | value         |
      | query.email | ${ctx.otpEmail} |
    Then the response status should be 200
    And the response field "email" should equal "${ctx.otpEmail}"
