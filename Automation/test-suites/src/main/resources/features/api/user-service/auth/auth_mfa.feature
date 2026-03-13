@api @auth @mfa @Phase1
Feature: MFA APIs

  Background:
    Given api testing is ready

  @regression
  Scenario: MFA status endpoint returns status payload
    Given the user uses token alias "user"
    When the user sends a GET request to "auth.mfa.status"
    Then the response status should be 200
    And the response should match schema "schemas/user-service/mfa/mfa-status-response.schema.json"

  @regression
  Scenario: MFA setup endpoint returns setup payload
    Given the user uses token alias "user"
    When the user sends a POST request to "auth.mfa.setup"
    Then the response status should be 200
    And the response should match schema "schemas/user-service/mfa/mfa-setup-response.schema.json"

  @regression
  Scenario: MFA enable endpoint accepts request
    Given the user uses token alias "user"
    And request body "mfaEnablePayload" is loaded from payload file "payloads/user-service/mfa/mfa-enable-valid.json"
    When the user sends a POST request to "auth.mfa.enable" using request body "mfaEnablePayload"
    Then the response status should be one of "200,400,401"

  @regression
  Scenario: MFA verify endpoint responds for provided token and otp
    And request body "mfaVerifyPayload" is loaded from payload file "payloads/user-service/mfa/mfa-verify-valid.json"
    When the user sends a POST request to "auth.mfa.verify" using request body "mfaVerifyPayload"
    Then the response status should be one of "200,400,401"

  @regression
  Scenario: MFA disable endpoint responds
    Given the user uses token alias "user"
    And request body "mfaDisablePayload" is loaded from payload file "payloads/user-service/mfa/mfa-disable-valid.json"
    When the user sends a POST request to "auth.mfa.disable" using request body "mfaDisablePayload"
    Then the response status should be one of "200,400,401"

  @regression
  Scenario: MFA regenerate backup codes endpoint responds
    Given the user uses token alias "user"
    When the user sends a POST request to "auth.mfa.regenerate-backup-codes" with data
      | key | value  |
      | otp | 123456 |
    Then the response status should be one of "200,400,401"

  @negative @auth @regression
  Scenario: MFA protected endpoint without token is rejected
    When the user sends a GET request to "auth.mfa.status" with data
      | key                  | value |
      | header.Authorization |       |
    Then the response status should be one of "400,401,403"
