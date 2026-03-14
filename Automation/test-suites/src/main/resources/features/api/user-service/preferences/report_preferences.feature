@api @preferences @Phase4
Feature: User report preference APIs

  Background:
    Given api testing is ready
    And the user uses token alias "user"

  @smoke @regression
  Scenario Outline: Get preference for <controller>
    When the user sends a GET request to "<getEndpoint>"
    Then the response status should be one of "200,204"

    Examples:
      | controller | getEndpoint          |
      | dashboard  | pref.dashboard.get   |
      | expense    | pref.expense.get     |
      | category   | pref.category.get    |
      | payment    | pref.payment.get     |
      | friendship | pref.friendship.get  |
      | budget     | pref.budget.get      |
      | bill       | pref.bill.get        |

  @regression
  Scenario Outline: Save preference for <controller>
    And request body "prefSavePayload" uses the "preference-save-valid" payload
    When the user sends a POST request to "<saveEndpoint>" using request body "prefSavePayload"
    Then the request should succeed
    And the response should match the "preference-response" schema

    Examples:
      | controller | saveEndpoint          |
      | dashboard  | pref.dashboard.save   |
      | expense    | pref.expense.save     |
      | category   | pref.category.save    |
      | payment    | pref.payment.save     |
      | friendship | pref.friendship.save  |
      | budget     | pref.budget.save      |
      | bill       | pref.bill.save        |

  @regression
  Scenario Outline: Delete preference for <controller>
    When the user sends a DELETE request to "<deleteEndpoint>"
    Then the response status should be one of "200,204"

    Examples:
      | controller | deleteEndpoint         |
      | dashboard  | pref.dashboard.delete  |
      | expense    | pref.expense.delete    |
      | category   | pref.category.delete   |
      | payment    | pref.payment.delete    |
      | friendship | pref.friendship.delete |
      | budget     | pref.budget.delete     |
      | bill       | pref.bill.delete       |

  @validation @negative @regression
  Scenario Outline: Validation failure on blank layoutConfig for <controller>
    And request body "prefInvalidPayload" uses the "preference-save-invalid" payload
    When the user sends a POST request to "<saveEndpoint>" using request body "prefInvalidPayload"
    Then the response should indicate "bad request"

    Examples:
      | controller | saveEndpoint         |
      | dashboard  | pref.dashboard.save  |
      | expense    | pref.expense.save    |
      | category   | pref.category.save   |
      | payment    | pref.payment.save    |
      | friendship | pref.friendship.save |

  @auth @negative @regression
  Scenario Outline: Unauthorized access is rejected for <controller>
    When the user sends a GET request to "<getEndpoint>" with data
      | key                  | value |
      | header.Authorization |       |
    Then the response status should be one of "400,401,403"

    Examples:
      | controller | getEndpoint         |
      | dashboard  | pref.dashboard.get  |
      | expense    | pref.expense.get    |
      | category   | pref.category.get   |
      | payment    | pref.payment.get    |
      | friendship | pref.friendship.get |
      | budget     | pref.budget.get     |
      | bill       | pref.bill.get       |
