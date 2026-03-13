@api @auth @Phase1
Feature: OAuth2 APIs

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: OAuth2 health endpoint is reachable
    When the user sends a GET request to "auth.oauth2.health"
    Then the response status should be 200

  @regression
  Scenario: Google auth endpoint returns contract response
    And request body "googleAuthPayload" is loaded from payload file "payloads/user-service/auth/google-auth-valid.json"
    When the user sends a POST request to "auth.oauth2.google" using request body "googleAuthPayload"
    Then the response status should be one of "200,201,400,401"

  @validation @negative @regression
  Scenario: Google auth rejects invalid payload
    And request body "googleAuthInvalidPayload" is loaded from payload file "payloads/user-service/auth/google-auth-invalid.json"
    When the user sends a POST request to "auth.oauth2.google" using request body "googleAuthInvalidPayload"
    Then the response status should be one of "400,401"
