@bills @api @regression @import-export
Feature: Bill Service Import/Export API

  Background:
    Given api testing is ready
    And the user is logged in with test credentials

  Scenario: Export bills to Excel
    When the user sends a GET request to "bills.export-excel"
    Then the request should succeed

  Scenario: Get OCR status
    When the user sends a GET request to "bills.ocr-status"
    Then the request should succeed
