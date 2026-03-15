@auth
Feature: Authentication API flows

  @api @smoke @requiresCredentials @data-optional
  Scenario: Sign-in returns a token and the correct profile
    Given the sign-in api is ready
    When the user signs in with test credentials
    Then sign-in returns an access token
    And the profile should match the signed-in user

  @api @regression @template @dsl
  Scenario: Sign-in request is processed through generic API steps
    Given api testing is ready
    And request body "signinPayload" is defined as
      | key      | value                  |
      | email    | ${suite.auth.username} |
      | password | ${suite.auth.password} |
    When the user sends a POST request to "auth.signin" using request body "signinPayload"
    Then the response status should be one of "200"
    And store response field "jwt" as "jwt"
