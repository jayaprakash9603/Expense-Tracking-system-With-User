@auth
Feature: OTP and MFA verification support

  @ui @otp @regression @requiresCredentials
  Scenario: OTP verification can provide a code
    Given the user is on "Login" page
    And otp verification is configured
    Then an otp code can be retrieved

  @ui @mfa @regression @requiresCredentials
  Scenario: MFA verification can provide a code
    Given the user is on "Login" page
    And mfa verification is configured
    Then an mfa code can be retrieved
