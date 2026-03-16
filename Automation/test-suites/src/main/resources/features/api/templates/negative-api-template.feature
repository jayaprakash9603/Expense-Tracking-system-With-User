@template @api @negative
Feature: [SERVICE] [DOMAIN] negative scenarios
  # ┌──────────────────────────────────────────────────────────────────┐
  # │  OPTIONAL: Copy alongside your positive feature file.
  # │  These patterns test validation, bad input, and missing data.
  # │  Replace [endpoint.key] with key from config/endpoints/<service>/<domain>.yaml
  # └──────────────────────────────────────────────────────────────────┘

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  # ── Missing required field ────────────────────────────────────────
  @api @validation
  Scenario: Create [resource] with missing required field
    When the user sends a POST request to "[endpoint.key]" with data
      | key  | value |
      | name |       |
    Then the response should indicate "bad request"

  # ── Invalid field value ───────────────────────────────────────────
  @api @validation
  Scenario: Create [resource] with invalid field value
    When the user sends a POST request to "[endpoint.key]" with data
      | key    | value   |
      | amount | -999    |
    Then the response should indicate "bad request"

  # ── Resource not found ────────────────────────────────────────────
  @api @not-found
  Scenario: Retrieve [resource] with non-existent ID
    When the user sends a GET request to "[endpoint.key]" with data
      | key     | value                                |
      | path.id | 00000000-0000-0000-0000-000000000000 |
    Then the response should indicate "not found"

  # ── Duplicate creation ────────────────────────────────────────────
  @api @conflict
  Scenario: Create [resource] that already exists
    When the user sends a POST request to "[endpoint.key]" with data
      | key  | value           |
      | name | Duplicate Name  |
    Then the response status should be one of "200,201,409"
