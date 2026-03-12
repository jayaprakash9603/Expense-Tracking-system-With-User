@auth
Feature: OTP and MFA verification support

  @ui @otp @regression @requiresCredentials
  Scenario: OTP verification can provide a code
    Given the login flow is ready
    And otp verification is configured
    Then an otp code can be retrieved

  @ui @mfa @regression @requiresCredentials
  Scenario: MFA verification can provide a code
    Given the login flow is ready
    And mfa verification is configured
    Then an mfa code can be retrieved
