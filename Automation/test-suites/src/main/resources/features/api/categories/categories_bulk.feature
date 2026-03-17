@categories @api @regression @bulk
Feature: Category Service Bulk Operations API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Bulk create categories
    Given request body "bulkPayload" is loaded from payload file "payloads/category-service/create_category.json"
    When the user sends a POST request to "categories.bulk-create" using request body "bulkPayload"
    Then the request should succeed
