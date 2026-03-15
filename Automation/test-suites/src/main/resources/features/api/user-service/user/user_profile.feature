@api @Phase2
Feature: User profile read APIs

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: Get profile returns current user
    Given the user uses token alias "user"
    When the user sends a GET request to "user.profile"
    Then the request should succeed
    And the response should match the "user-profile-success" schema
    And the response time should be less than 5000 ms

  @regression
  Scenario: Get user by email returns matching user
    Given the user uses token alias "user"
    When the user sends a GET request to "user.profile"
    Then the request should succeed
    And store response field "email" as "currentEmail"
    When the user sends a GET request to "user.by-email" with data
      | key         | value              |
      | query.email | ${ctx.currentEmail} |
    Then the request should succeed
    And the response should match the "user-email-success" schema

  @smoke @regression
  Scenario: Get all users returns list
    When the user sends a GET request to "user.all"
    Then the request should succeed
    And the response list "$" should have at least 0 items
    And the response should match the "user-all-success" schema

  @regression
  Scenario: Get user by id returns requested user
    Given the user uses token alias "user"
    And the current user id is stored as "currentUserId"
    When the user sends a GET request to "user.by-id" with data
      | key     | value                |
      | path.id | ${ctx.currentUserId} |
    Then the request should succeed
    And the response should match the "user-by-id-success" schema

  @auth @negative @regression
  Scenario: Missing authorization returns unauthorized style response
    When the user sends a GET request to "user.profile" with data
      | key                  | value |
      | header.Authorization |       |
    Then the response status should be one of "400,401,403"

  @auth @negative @regression
  Scenario: Invalid authorization token is rejected
    Given the user uses token alias "invalid"
    When the user sends a GET request to "user.profile"
    Then the response should indicate "unauthorized access"
    And the response should match the "error-jwt-filter" schema
