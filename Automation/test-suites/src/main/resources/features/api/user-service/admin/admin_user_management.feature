@api @admin @Phase3
Feature: Admin user management APIs

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: Admin user list returns paginated payload
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.users.list" with data
      | key        | value |
      | query.page | 0     |
      | query.size | 10    |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/admin/admin-user-list.schema.json"

  @regression
  Scenario: Admin get user by id returns user detail
    Given the user uses token alias "admin"
    And the user uses token alias "user"
    And the current user id is stored as "lookupUserId"
    And the user uses token alias "admin"
    When the user sends a GET request to "admin.users.by-id" with data
      | key         | value               |
      | path.userId | ${ctx.lookupUserId} |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/admin/admin-user-detail.schema.json"

  @regression
  Scenario: Admin status update endpoint responds
    Given the user uses token alias "admin"
    And request body "statusPayload" is loaded from payload file "payloads/user-service/admin/update-user-status.json"
    And the user uses token alias "user"
    And the current user id is stored as "statusUserId"
    And the user uses token alias "admin"
    When the user sends a PUT request to "admin.users.status" using request body "statusPayload" with data
      | key         | value               |
      | path.userId | ${ctx.statusUserId} |
    Then the response status should be one of "200,400"

  @regression
  Scenario: Admin delete user endpoint responds
    Given the user uses token alias "admin"
    And a disposable user is created with aliases "adminDeleteUserId", "adminDeleteUserEmail", "adminDeleteUserToken"
    When the user sends a DELETE request to "admin.users.delete" with data
      | key         | value                    |
      | path.userId | ${ctx.adminDeleteUserId} |
    Then the response status should be one of "200,204"

  @regression
  Scenario: Admin bulk action endpoint responds
    Given the user uses token alias "admin"
    And request body "bulkActionPayload" is loaded from payload file "payloads/user-service/admin/bulk-action-activate.json"
    When the user sends a POST request to "admin.users.bulk-action" using request body "bulkActionPayload"
    Then the response status should be one of "200,400"
    And the response should match schema "schemas/user-service/admin/admin-bulk-action-response.schema.json"

  @regression
  Scenario: Admin users stats endpoint returns data
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.users.stats"
    Then the response status should be 200
    And the response should match schema "schemas/user-service/admin/admin-user-stats.schema.json"

  @regression
  Scenario: Admin users search endpoint returns data
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.users.search" with data
      | key         | value |
      | query.query | auto  |
      | query.limit | 10    |
    Then the response status should be 200

  @regression
  Scenario: Admin all endpoint responds
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.all"
    Then the response status should be 200

  @auth @negative @regression
  Scenario: Non-admin token is forbidden for admin users list
    Given the user uses token alias "user"
    When the user sends a GET request to "admin.users.list"
    Then the response status should be 403
