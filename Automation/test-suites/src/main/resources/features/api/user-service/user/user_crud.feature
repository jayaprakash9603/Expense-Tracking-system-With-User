@api @Phase2
Feature: User update and delete APIs

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: Update user profile succeeds
    Given the user uses token alias "user"
    And request body "validUpdatePayload" is loaded from payload file "payloads/user/update-user-valid.json"
    When the user sends a PUT request to "user.update" using request body "validUpdatePayload"
    Then the response status should be 200
    And the response should match schema "schemas/user/user-update-success.schema.json"

  @validation @negative @regression
  Scenario: Invalid fields in update payload return field errors
    Given the user uses token alias "user"
    And request body "invalidUpdatePayload" is loaded from payload file "payloads/user/update-user-invalid.json"
    When the user sends a PUT request to "user.update" using request body "invalidUpdatePayload"
    Then the response status should be 400
    And the response should match schema "schemas/user/error-api.schema.json"
    And the response field "fieldErrors" should be present

  @smoke @regression
  Scenario: Update two factor flag succeeds
    Given the user uses token alias "user"
    And request body "twoFactorEnabledPayload" is loaded from payload file "payloads/user/two-factor-enabled.json"
    When the user sends a PUT request to "user.two-factor" using request body "twoFactorEnabledPayload"
    Then the response status should be 200
    And the response should match schema "schemas/user/user-two-factor-success.schema.json"

  @validation @negative @regression
  Scenario: Null enabled value in two factor update returns bad request
    Given the user uses token alias "user"
    And request body "invalidTwoFactorPayload" is loaded from payload file "payloads/user/two-factor-null.json"
    When the user sends a PUT request to "user.two-factor" using request body "invalidTwoFactorPayload"
    Then the response status should be 400
    And the response should match schema "schemas/user/error-api.schema.json"

  @smoke @regression
  Scenario: Delete user by id returns plain success text
    Given the user uses token alias "admin"
    And a disposable user is created with aliases "deletableUserId", "deletableUserEmail", "deletableUserToken"
    When the user sends a DELETE request to "user.delete" with data
      | key     | value                  |
      | path.id | ${ctx.deletableUserId} |
    Then the response status should be 200
    And the response body should contain "User deleted successfully"
