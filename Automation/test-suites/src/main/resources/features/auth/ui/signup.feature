@auth @ui @signup
Feature: Signup UI flows

  @smoke @data-optional
  Scenario: User is redirected to login after successful signup
    Given the user is on "Signup" page
    When the user signs up with valid details
    Then the user should be on "Login" page

  @regression @data-optional
  Scenario: User sees validation error for missing signup fields
    Given the user is on "Signup" page
    When the user tries to sign up with missing mandatory details
    Then the signup error message should contain "Enter all the mandatory fields"

  @smoke @data-optional
  Scenario: User can register and then login with new credentials
    Given the user is on "Signup" page
    When the user signs up with valid details
    Then the user should be on "Login" page
    When the user logs in with the registered credentials
    Then the user should be on "Dashboard" page
