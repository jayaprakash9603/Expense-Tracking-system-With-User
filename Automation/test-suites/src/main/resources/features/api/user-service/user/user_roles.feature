@api @admin @Phase2
Feature: User role mapping APIs

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: Add role to user succeeds
    Given the user uses token alias "admin"
    And a disposable user is created with aliases "roleManagedUserId", "roleManagedUserEmail", "roleManagedUserToken"
    And the "ADMIN" role id is stored as "adminRoleId"
    When the user sends a POST request to "user.assign-role" with data
      | key         | value                    |
      | path.userId | ${ctx.roleManagedUserId} |
      | path.roleId | ${ctx.adminRoleId}       |
    Then the request should succeed
    And the response should match the "user-add-role-success" schema

  @smoke @regression
  Scenario: Remove role from user succeeds
    Given the user uses token alias "admin"
    And a disposable user is created with aliases "removableRoleUserId", "removableRoleUserEmail", "removableRoleUserToken"
    And the "ADMIN" role id is stored as "adminRoleId"
    When the user sends a POST request to "user.assign-role" with data
      | key         | value                       |
      | path.userId | ${ctx.removableRoleUserId}  |
      | path.roleId | ${ctx.adminRoleId}          |
    Then the request should succeed
    When the user sends a DELETE request to "user.remove-role" with data
      | key         | value                       |
      | path.userId | ${ctx.removableRoleUserId}  |
      | path.roleId | ${ctx.adminRoleId}          |
    Then the request should succeed
    And the response should match the "user-remove-role-success" schema

  @auth @negative @regression
  Scenario: Non admin cannot add role
    Given the user uses token alias "user"
    And the current user id is stored as "currentUserId"
    And the "ADMIN" role id is stored as "adminRoleId"
    When the user sends a POST request to "user.assign-role" with data
      | key         | value                |
      | path.userId | ${ctx.currentUserId} |
      | path.roleId | ${ctx.adminRoleId}   |
    Then the response status should be one of "403,500"

  @negative @regression
  Scenario: Add role conflict returns conflict
    Given the user uses token alias "admin"
    And role add conflict aliases are prepared as "conflictUserId" and "conflictRoleId"
    When the user sends a POST request to "user.assign-role" with data
      | key         | value                 |
      | path.userId | ${ctx.conflictUserId} |
      | path.roleId | ${ctx.conflictRoleId} |
    Then the response should indicate "conflict"
    And the response should match the "error-map" schema
