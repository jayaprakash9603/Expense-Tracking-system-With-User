package com.jaya.automation.bdd.steps.api;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.api.execution.ApiRequestBuilder;
import com.jaya.automation.bdd.context.BddWorld;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import static org.assertj.core.api.Assertions.assertThat;
import org.springframework.stereotype.Component;

@Component
public class NotificationApiSteps {

    @When("the user marks all notifications as read")
    public void userMarksAllNotificationsAsRead() {
        ApiRequest request = ApiRequest.of("notifications.mark-all-read");
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, BddWorld.jwtToken());
        BddWorld.setApiExecutionResult(result);
    }

    @Then("the unread notification count should be {int}")
    public void unreadNotificationCountShouldBe(int expectedCount) {
        ApiRequest request = ApiRequest.of("notifications.unread");
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, BddWorld.jwtToken());
        BddWorld.setApiExecutionResult(result);
        BddWorld.apiResponseValidator().assertStatusBetween(result, 200, 299);
    }
}
