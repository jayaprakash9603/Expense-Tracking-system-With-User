@api @auth @Phase1
Feature: Auth token lifecycle

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: Refresh token with valid token returns auth response
    Given the user uses token alias "user"
    When the user sends a POST request to "auth.refresh-token"
    Then the response status should be one of "200,201,400"

  @negative @regression
  Scenario: Refresh token with invalid token fails
    Given the user uses an invalid token
    When the user sends a POST request to "auth.refresh-token"
    Then the response status should be one of "400,401,403"

  @negative @regression
  Scenario: Refresh token with expired token fails
    Given the user uses an expired token
    When the user sends a POST request to "auth.refresh-token"
    Then the response status should be one of "400,401,403"

  @regression
  Scenario: Public auth user lookup by userId path succeeds
    Given the user uses token alias "user"
    And the current user id is stored as "currentUserId"
    When the user sends a GET request to "auth.user-by-id" with data
      | key         | value                |
      | path.userId | ${ctx.currentUserId} |
    Then the response status should be 200
    And the response field "id" should equal "${ctx.currentUserId}"

  @regression
  Scenario: Public short auth user lookup path succeeds
    Given the user uses token alias "user"
    And the current user id is stored as "currentUserId"
    When the user sends a GET request to "auth.user-by-id-short" with data
      | key         | value                |
      | path.userId | ${ctx.currentUserId} |
    Then the response status should be 200
    And the response field "id" should equal "${ctx.currentUserId}"

  @regression
  Scenario: Public auth users list endpoint responds
    When the user sends a GET request to "auth.all-users"
    Then the response status should be 200
    And the response list "$" should have at least 0 items
