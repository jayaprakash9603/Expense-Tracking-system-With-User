@template @api @positive
Feature: [SERVICE] [DOMAIN] positive scenarios
  # ┌──────────────────────────────────────────────────────────────────┐
  # │  COPY THIS FILE to features/api/<service>/<domain>/<name>.feature
  # │  Replace placeholders:
  # │    [SERVICE]       → e.g. user-service, expense-service
  # │    [DOMAIN]        → e.g. auth, user, expenses, budgets
  # │    [endpoint.key]  → key from config/endpoints/<service>/<domain>.yaml
  # │    [schema-key]    → filename without .schema.json suffix
  # │    [payload-key]   → filename without .json suffix
  # │
  # │  Folder convention:
  # │    Endpoints → config/endpoints/<service>/<domain>.yaml
  # │    Schemas   → schemas/<service>/<domain>/<name>.schema.json
  # │    Payloads  → payloads/<service>/<domain>/<name>.json
  # │    Features  → features/api/<service>/<domain>/<name>.feature
  # └──────────────────────────────────────────────────────────────────┘

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  # ── GET endpoint (no body, no path params) ────────────────────────
  @api @smoke
  Scenario: Retrieve [resource] successfully
    When the user sends a GET request to "[endpoint.key]"
    Then the request should succeed
    And the response should match the "[schema-key]" schema

  # ── GET endpoint with query parameters ────────────────────────────
  @api @smoke
  Scenario: Retrieve [resource] with filters
    When the user sends a GET request to "[endpoint.key]" with data
      | key         | value       |
      | query.page  | 0           |
      | query.limit | 10          |
    Then the request should succeed

  # ── GET endpoint with path parameters ─────────────────────────────
  @api @smoke
  Scenario: Retrieve [resource] by ID
    When the user sends a GET request to "[endpoint.key]" with data
      | key     | value        |
      | path.id | ${saved.id}  |
    Then the request should succeed
    And the response field "id" should be present

  # ── POST endpoint with inline body ────────────────────────────────
  @api @smoke
  Scenario: Create [resource] with valid data
    When the user sends a POST request to "[endpoint.key]" with data
      | key         | value              |
      | name        | Test Resource      |
      | description | Created by test    |
    Then the response status should be one of "200,201"
    And the response field "id" should be present
    And store response field "id" as "saved.id"

  # ── POST endpoint with payload file ───────────────────────────────
  @api @smoke
  Scenario: Create [resource] from payload file
    Given request body "createPayload" uses the "[payload-key]" payload
    When the user sends a POST request to "[endpoint.key]" using request body "createPayload"
    Then the response status should be one of "200,201"
    And the response should match the "[schema-key]" schema

  # ── PUT endpoint ──────────────────────────────────────────────────
  @api
  Scenario: Update [resource] successfully
    When the user sends a PUT request to "[endpoint.key]" with data
      | key     | value           |
      | path.id | ${saved.id}     |
      | name    | Updated Name    |
    Then the request should succeed

  # ── DELETE endpoint ───────────────────────────────────────────────
  @api
  Scenario: Delete [resource] successfully
    When the user sends a DELETE request to "[endpoint.key]" with data
      | key     | value        |
      | path.id | ${saved.id}  |
    Then the response status should be one of "200,204"
