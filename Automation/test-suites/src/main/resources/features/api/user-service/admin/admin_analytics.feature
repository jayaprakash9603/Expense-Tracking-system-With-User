@api @admin @Phase3
Feature: Admin analytics APIs

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: Analytics overview returns data
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.analytics.overview" with data
      | key             | value |
      | query.timeRange | 7d    |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/analytics/analytics-overview.schema.json"

  @regression
  Scenario: Analytics top categories returns data
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.analytics.top-categories" with data
      | key             | value |
      | query.timeRange | 30d   |
      | query.limit     | 5     |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/analytics/analytics-top-categories.schema.json"

  @regression
  Scenario: Analytics recent activity returns data
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.analytics.recent-activity" with data
      | key         | value |
      | query.hours | 48    |
      | query.limit | 20    |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/analytics/analytics-recent-activity.schema.json"

  @regression
  Scenario: Analytics top users returns data
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.analytics.top-users" with data
      | key         | value |
      | query.limit | 10    |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/analytics/analytics-top-users.schema.json"

  @regression
  Scenario: Analytics user stats returns data
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.analytics.user-stats" with data
      | key             | value |
      | query.timeRange | 30d   |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/admin/admin-user-stats.schema.json"

  @regression
  Scenario: Analytics dashboard returns data
    Given the user uses token alias "admin"
    When the user sends a GET request to "admin.analytics.dashboard" with data
      | key             | value |
      | query.timeRange | 7d    |
    Then the response status should be 200
    And the response should match schema "schemas/user-service/analytics/analytics-dashboard.schema.json"

  @auth @negative @regression
  Scenario: Non-admin token is forbidden for analytics
    Given the user uses token alias "user"
    When the user sends a GET request to "admin.analytics.overview"
    Then the response status should be 403
