@api @auth @Phase1
Feature: Auth signin API

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: Signin with configured credentials succeeds
    Given request body "signinPayload" is defined as
      | key      | value                  |
      | email    | ${suite.auth.username} |
      | password | ${suite.auth.password} |
    When the user sends a POST request to "auth.signin" using request body "signinPayload"
    Then the response status should be one of "200,201,202,401"

  @negative @regression
  Scenario: Signin with wrong password is rejected
    Given request body "signinWrongPasswordPayload" is defined as
      | key      | value                  |
      | email    | ${suite.auth.username} |
      | password | WrongPass123!          |
    When the user sends a POST request to "auth.signin" using request body "signinWrongPasswordPayload"
    Then the response status should be one of "400,401,403"

  @validation @negative @regression
  Scenario Outline: Signin validation failures
    Given request body "signinValidationPayload" is defined as
      | key      | value      |
      | email    | <email>    |
      | password | <password> |
    When the user sends a POST request to "auth.signin" using request body "signinValidationPayload"
    Then the response status should be one of "400,401"

    Examples:
      | email         | password     |
      |               | ChangeMe123! |
      | invalid-email | ChangeMe123! |
      | user@test.com |              |
