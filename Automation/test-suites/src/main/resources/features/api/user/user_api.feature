@api @user-api
Feature: User API automation

  Background:
    Given api testing is ready

  @smoke
  Scenario: Get profile returns current user
    Given the user uses token alias "user"
    When the user sends a GET request to "user.profile"
    Then the response status should be 200
    And the response should match schema "schemas/user/user-profile-success.schema.json"

  @smoke
  Scenario: Get user by email returns matching user
    Given the user uses token alias "user"
    When the user sends a GET request to "user.profile"
    Then the response status should be 200
    And store response field "email" as "currentEmail"
    When the user sends a GET request to "user.by-email" with data
      | key         | value              |
      | query.email | ${ctx.currentEmail} |
    Then the response status should be 200
    And the response should match schema "schemas/user/user-email-success.schema.json"

  @smoke
  Scenario: Get all users returns list
    When the user sends a GET request to "user.all"
    Then the response status should be 200
    And the response list "$" should have at least 0 items
    And the response should match schema "schemas/user/user-all-success.schema.json"

  @smoke
  Scenario: Get user by id returns requested user
    Given the user uses token alias "user"
    And the current user id is stored as "currentUserId"
    When the user sends a GET request to "user.by-id" with data
      | key     | value                |
      | path.id | ${ctx.currentUserId} |
    Then the response status should be 200
    And the response should match schema "schemas/user/user-by-id-success.schema.json"

  @smoke
  Scenario: Update user profile succeeds
    Given the user uses token alias "user"
    And request body "validUpdatePayload" is loaded from payload file "payloads/user/update-user-valid.json"
    When the user sends a PUT request to "user.update" using request body "validUpdatePayload"
    Then the response status should be 200
    And the response should match schema "schemas/user/user-update-success.schema.json"

  @smoke
  Scenario: Update two factor flag succeeds
    Given the user uses token alias "user"
    And request body "twoFactorEnabledPayload" is loaded from payload file "payloads/user/two-factor-enabled.json"
    When the user sends a PUT request to "user.two-factor" using request body "twoFactorEnabledPayload"
    Then the response status should be 200
    And the response should match schema "schemas/user/user-two-factor-success.schema.json"

  @smoke
  Scenario: Delete user by id returns plain success text
    Given the user uses token alias "admin"
    And a disposable user is created with aliases "deletableUserId", "deletableUserEmail", "deletableUserToken"
    When the user sends a DELETE request to "user.delete" with data
      | key     | value                  |
      | path.id | ${ctx.deletableUserId} |
    Then the response status should be 200
    And the response body should contain "User deleted successfully"

  @smoke
  Scenario: Add role to user succeeds
    Given the user uses token alias "admin"
    And a disposable user is created with aliases "roleManagedUserId", "roleManagedUserEmail", "roleManagedUserToken"
    And the ADMIN role id is stored as "adminRoleId"
    When the user sends a POST request to "user.assign-role" with data
      | key         | value                    |
      | path.userId | ${ctx.roleManagedUserId} |
      | path.roleId | ${ctx.adminRoleId}       |
    Then the response status should be 200
    And the response should match schema "schemas/user/user-add-role-success.schema.json"

  @smoke
  Scenario: Remove role from user succeeds
    Given the user uses token alias "admin"
    And a disposable user is created with aliases "removableRoleUserId", "removableRoleUserEmail", "removableRoleUserToken"
    And the ADMIN role id is stored as "adminRoleId"
    When the user sends a POST request to "user.assign-role" with data
      | key         | value                       |
      | path.userId | ${ctx.removableRoleUserId}  |
      | path.roleId | ${ctx.adminRoleId}          |
    Then the response status should be 200
    When the user sends a DELETE request to "user.remove-role" with data
      | key         | value                       |
      | path.userId | ${ctx.removableRoleUserId}  |
      | path.roleId | ${ctx.adminRoleId}          |
    Then the response status should be 200
    And the response should match schema "schemas/user/user-remove-role-success.schema.json"

  @smoke
  Scenario: Switch mode accepts valid mode
    Given the user uses token alias "user"
    When the user sends a PUT request to "user.switch-mode" with data
      | key        | value |
      | query.mode | USER  |
    Then the response status should be 200
    And the response should match schema "schemas/user/user-switch-mode-success.schema.json"

  @validation @negative
  Scenario: Invalid email on get by email returns bad request
    Given the user uses token alias "user"
    When the user sends a GET request to "user.by-email" with data
      | key         | value         |
      | query.email | invalid-email |
    Then the response status should be 400
    And the response should match schema "schemas/user/error-api.schema.json"
    And the response field "fieldErrors" should be present

  @validation @negative
  Scenario: Non positive id on get by id returns bad request
    Given the user uses token alias "user"
    When the user sends a GET request to "user.by-id" with data
      | key     | value |
      | path.id | 0     |
    Then the response status should be 400
    And the response should match schema "schemas/user/error-api.schema.json"

  @validation @negative
  Scenario: Non positive id on delete returns bad request
    Given the user uses token alias "admin"
    When the user sends a DELETE request to "user.delete" with data
      | key     | value |
      | path.id | 0     |
    Then the response status should be 400
    And the response should match schema "schemas/user/error-api.schema.json"

  @validation @negative
  Scenario: Invalid fields in update payload return field errors
    Given the user uses token alias "user"
    And request body "invalidUpdatePayload" is loaded from payload file "payloads/user/update-user-invalid.json"
    When the user sends a PUT request to "user.update" using request body "invalidUpdatePayload"
    Then the response status should be 400
    And the response should match schema "schemas/user/error-api.schema.json"
    And the response field "fieldErrors" should be present

  @validation @negative
  Scenario: Null enabled value in two factor update returns bad request
    Given the user uses token alias "user"
    And request body "invalidTwoFactorPayload" is loaded from payload file "payloads/user/two-factor-null.json"
    When the user sends a PUT request to "user.two-factor" using request body "invalidTwoFactorPayload"
    Then the response status should be 400
    And the response should match schema "schemas/user/error-api.schema.json"
    And the response field "fieldErrors" should be present

  @auth @negative
  Scenario: Non admin cannot access another user profile
    Given the user uses token alias "user"
    And the current user id is stored as "targetUserId"
    And a disposable user is created with aliases "nonAdminUserId", "nonAdminUserEmail", "nonAdmin"
    And the user uses token alias "nonAdmin"
    When the user sends a GET request to "user.by-id" with data
      | key     | value               |
      | path.id | ${ctx.targetUserId} |
    Then the response status should be 403
    And the response should match schema "schemas/user/error-map.schema.json"
    And the response should contain error message "permission"

  @negative
  Scenario: Add role conflict returns conflict
    Given the user uses token alias "admin"
    And role add conflict aliases are prepared as "conflictUserId" and "conflictRoleId"
    When the user sends a POST request to "user.assign-role" with data
      | key         | value                 |
      | path.userId | ${ctx.conflictUserId} |
      | path.roleId | ${ctx.conflictRoleId} |
    Then the response status should be 409
    And the response should match schema "schemas/user/error-map.schema.json"

  @negative
  Scenario: Remove role conflict returns conflict
    Given the user uses token alias "admin"
    And role remove conflict aliases are prepared as "removeConflictUserId" and "removeConflictRoleId"
    When the user sends a DELETE request to "user.remove-role" with data
      | key         | value                       |
      | path.userId | ${ctx.removeConflictUserId} |
      | path.roleId | ${ctx.removeConflictRoleId} |
    Then the response status should be 409
    And the response should match schema "schemas/user/error-map.schema.json"

  @negative
  Scenario: Removing last role returns bad request
    Given the user uses token alias "admin"
    And remove last role aliases are prepared as "lastRoleUserId" and "lastRoleId"
    When the user sends a DELETE request to "user.remove-role" with data
      | key         | value               |
      | path.userId | ${ctx.lastRoleUserId} |
      | path.roleId | ${ctx.lastRoleId}     |
    Then the response status should be 400
    And the response should match schema "schemas/user/error-map.schema.json"

  @validation @negative
  Scenario: Invalid mode on switch mode returns bad request
    Given the user uses token alias "user"
    When the user sends a PUT request to "user.switch-mode" with data
      | key        | value       |
      | query.mode | SUPER_ADMIN |
    Then the response status should be 400
    And the response should match schema "schemas/user/error-map.schema.json"

  @auth @negative
  Scenario: Missing authorization returns unauthorized style response
    When the user sends a GET request to "user.profile" with data
      | key                  | value |
      | header.Authorization |       |
    Then the response status should be one of "400,401,403"

  @auth @negative
  Scenario: Invalid authorization token is rejected
    Given the user uses an invalid token
    When the user sends a GET request to "user.profile"
    Then the response status should be 401
    And the response should match schema "schemas/user/error-jwt-filter.schema.json"

  @auth @negative
  Scenario: Expired authorization token is rejected
    Given the user uses an expired token
    When the user sends a GET request to "user.profile"
    Then the response status should be 401
    And the response should match schema "schemas/user/error-jwt-filter.schema.json"
