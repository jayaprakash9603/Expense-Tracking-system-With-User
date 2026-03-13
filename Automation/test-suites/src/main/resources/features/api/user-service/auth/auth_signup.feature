@api @auth @Phase1
Feature: Auth signup API

  Background:
    Given api testing is ready

  @smoke @regression
  Scenario: Signup with valid payload succeeds
    Given value "signupEmail" is set to "${random.email}"
    And request body "signupPayload" is defined as
      | key       | value             |
      | firstName | Auto              |
      | lastName  | Signup            |
      | email     | ${ctx.signupEmail} |
      | password  | ChangeMe123!      |
    When the user sends a POST request to "auth.signup" using request body "signupPayload"
    Then the response status should be 201
    And the response should match schema "schemas/user-service/auth/signup-success.schema.json"
    And store response token field "jwt" as token alias "signupUser"

  @validation @negative @regression
  Scenario: Signup validation errors are returned
    And request body "signupInvalidPayload" is loaded from payload file "payloads/user-service/auth/signup-invalid.json"
    When the user sends a POST request to "auth.signup" using request body "signupInvalidPayload"
    Then the response status should be 400
    And the response should match schema "schemas/user-service/common/validation-error.schema.json"

  @negative @regression
  Scenario: Duplicate signup request is rejected
    Given value "signupEmail" is set to "${random.email}"
    And request body "signupFirstPayload" is defined as
      | key       | value             |
      | firstName | Auto              |
      | lastName  | Duplicate         |
      | email     | ${ctx.signupEmail} |
      | password  | ChangeMe123!      |
    When the user sends a POST request to "auth.signup" using request body "signupFirstPayload"
    Then the response status should be 201
    When the user sends a POST request to "auth.signup" using request body "signupFirstPayload"
    Then the response status should be 409
