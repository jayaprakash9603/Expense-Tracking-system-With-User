@api @Phase2
Feature: User mode switch API

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario Outline: Switch mode accepts valid values
    Given the user uses token alias "user"
    When the user sends a PUT request to "user.switch-mode" with data
      | key        | value  |
      | query.mode | <mode> |
    Then the response status should be 200
    And the response should match schema "schemas/user/user-switch-mode-success.schema.json"

    Examples:
      | mode |
      | USER |

  @validation @negative @regression
  Scenario: Invalid mode on switch mode returns bad request
    Given the user uses token alias "user"
    When the user sends a PUT request to "user.switch-mode" with data
      | key        | value       |
      | query.mode | SUPER_ADMIN |
    Then the response status should be 400
    And the response should match schema "schemas/user/error-map.schema.json"

  @auth @negative @regression
  Scenario: Missing authorization token on switch mode is rejected
    When the user sends a PUT request to "user.switch-mode" with data
      | key                  | value |
      | query.mode           | USER  |
      | header.Authorization |       |
    Then the response status should be one of "400,401,403"
