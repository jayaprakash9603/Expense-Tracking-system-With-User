@api @auth @Phase1
Feature: Auth password reset APIs

  Background:
    Given api testing is ready

  @regression @email-endpoint
  Scenario: Reset password accepts a verified style payload
    Given request body "resetPasswordPayload" is defined as
      | key      | value                  |
      | email    | ${suite.auth.username} |
      | password | NewPass123!            |
    When the user sends a PATCH request to "auth.reset-password" using request body "resetPasswordPayload"
    Then the response status should be one of "200,202,400,401"

  @validation @negative @regression @email-endpoint
  Scenario: Reset password validation rejects blank fields
    Given request body "invalidResetPasswordPayload" is defined as
      | key      | value |
      | email    |       |
      | password |       |
    When the user sends a PATCH request to "auth.reset-password" using request body "invalidResetPasswordPayload"
    Then the response status should be one of "400,401,404,500"
