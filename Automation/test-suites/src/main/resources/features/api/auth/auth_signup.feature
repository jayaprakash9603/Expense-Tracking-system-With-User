@auth @api @regression
Feature: Auth Signup API

  Background:
    Given api testing is ready

  @smoke
  Scenario: Register a new user
    Given request body "signupPayload" is defined as
      | field     | value                             |
      | firstName | AutoTest                          |
      | lastName  | User${random.number:4}            |
      | email     | autotest_${random.number:6}@test.com |
      | password  | TestPass@1234                     |
      | gender    | male                              |
    When the user sends a POST request to "auth.signup" using request body "signupPayload"
    Then the response status should be one of "200,201"
    And the response field "message" should be present

  Scenario: Signup with existing email should fail
    And the user is logged in with test credentials
    Given request body "signupPayload" is defined as
      | field     | value                          |
      | firstName | Duplicate                      |
      | lastName  | User                           |
      | email     | ${suite.auth.test.email}       |
      | password  | TestPass@1234                  |
      | gender    | male                           |
    When the user sends a POST request to "auth.signup" using request body "signupPayload"
    Then the response status should be one of "400,409"

  Scenario: Check email availability
    Given request body "emailPayload" is defined as
      | field | value                                  |
      | email | unique_${random.number:8}@test.com     |
    When the user sends a POST request to "auth.check-email" using request body "emailPayload"
    Then the request should succeed
