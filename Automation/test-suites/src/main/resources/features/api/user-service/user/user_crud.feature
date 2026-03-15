@api @Phase2
Feature: User update and delete APIs

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: Update user profile succeeds
    Given the user uses token alias "user"
    And request body "validUpdatePayload" uses the "update-user-valid" payload
    When the user sends a PUT request to "user.update" using request body "validUpdatePayload"
    Then the request should succeed
    And the response should match the "user-update-success" schema

  @validation @negative @regression
  Scenario: Invalid fields in update payload return field errors
    Given the user uses token alias "user"
    And request body "invalidUpdatePayload" uses the "update-user-invalid" payload
    When the user sends a PUT request to "user.update" using request body "invalidUpdatePayload"
    Then the response should indicate "bad request"
    And the response should match the "error-api" schema
    And the response field "fieldErrors" should be present

  @smoke @regression
  Scenario: Update two factor flag succeeds
    Given the user uses token alias "user"
    And request body "twoFactorEnabledPayload" uses the "two-factor-enabled" payload
    When the user sends a PUT request to "user.two-factor" using request body "twoFactorEnabledPayload"
    Then the request should succeed
    And the response should match the "user-two-factor-success" schema

  @validation @negative @regression
  Scenario: Null enabled value in two factor update returns bad request
    Given the user uses token alias "user"
    And request body "invalidTwoFactorPayload" uses the "two-factor-null" payload
    When the user sends a PUT request to "user.two-factor" using request body "invalidTwoFactorPayload"
    Then the response should indicate "bad request"
    And the response should match the "error-api" schema

  @smoke @regression
  Scenario: Delete user by id returns plain success text
    Given the user uses token alias "admin"
    And a disposable user is created with aliases "deletableUserId", "deletableUserEmail", "deletableUserToken"
    When the user sends a DELETE request to "user.delete" with data
      | key     | value                  |
      | path.id | ${ctx.deletableUserId} |
    Then the request should succeed
    And the response body should contain "User deleted successfully"
