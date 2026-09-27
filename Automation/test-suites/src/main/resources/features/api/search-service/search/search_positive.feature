@search @api @positive @search
Feature: search-service search API positive scenarios

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  @smoke @regression
  Scenario: Update shortcuts via shortcuts.create
    Given request body "createBody" uses the "shortcut-create-valid" payload
    When the user sends a POST request to "shortcuts.create" using request body "createBody"
    Then the response status should be one of "200,201"
    And the response should match the "shortcut-item" schema
    And the response should pass validation rules for "search-service" "create_shortcut"

  @smoke
  Scenario: List resources via shortcuts.list
    When the user sends a GET request to "shortcuts.list"
    Then the response status should be one of "200,204"
    And the response should match the "shortcut-list" schema

  @regression
  Scenario Outline: Additional read endpoints return valid responses
    When the user sends a GET request to "<endpointKey>"
    Then the response status should be one of "200,204,400,404"
    And the response should match the "shortcut-list" schema
    Examples:
      | endpointKey |
      | search.universal |
