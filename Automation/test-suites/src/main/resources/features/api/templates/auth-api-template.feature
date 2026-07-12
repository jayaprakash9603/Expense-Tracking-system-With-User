@template @api @authorization
Feature: [SERVICE] [DOMAIN] authorization scenarios
  # ┌──────────────────────────────────────────────────────────────────┐
  # │  OPTIONAL: Copy alongside your positive feature file.
  # │  These patterns verify auth-protected endpoints reject
  # │  unauthenticated or unauthorized requests.
  # │  Replace [endpoint.key] with key from config/endpoints/<service>/<domain>.yaml
  # └──────────────────────────────────────────────────────────────────┘

  Background:
    Given api testing is ready

  # ── No token (unauthenticated) ────────────────────────────────────
  @api @auth @unauthenticated
  Scenario: Access [resource] without authentication
    When the user sends a GET request to "[endpoint.key]"
    Then the response should indicate "unauthorized"

  # ── Expired / invalid token ───────────────────────────────────────
  @api @auth @invalid-token
  Scenario: Access [resource] with invalid token
    Given value "jwt" is set to "Bearer invalid.token.value"
    When the user sends a GET request to "[endpoint.key]"
    Then the response should indicate "unauthorized"

  # ── Wrong role (forbidden) ────────────────────────────────────────
  @api @auth @forbidden
  Scenario: Access admin [resource] with regular user token
    Given the user is logged in with test credentials
    When the user sends a GET request to "[admin.endpoint.key]"
    Then the response status should be one of "401,403"
