package com.jaya.automation.bdd.steps.api;

import com.jaya.automation.bdd.context.BddWorld;
import io.cucumber.java.en.Then;

public class CommonAssertionSteps {
    @Then("the response time should be less than {long} ms")
    public void responseTimeShouldBeLessThan(long maxMillis) {
        long elapsedMillis = BddWorld.apiExecutionResult().response().time();
        if (elapsedMillis >= maxMillis) {
            throw new AssertionError("Expected response time < " + maxMillis + "ms but was " + elapsedMillis + "ms");
        }
    }

    @Then("the response field {string} should be absent")
    public void responseFieldShouldBeAbsent(String jsonPath) {
        if (BddWorld.apiExecutionResult().jsonPathValue(jsonPath).isPresent()) {
            throw new AssertionError("Expected json path to be absent: " + jsonPath);
        }
    }

    @Then("the response body should not contain {string}")
    public void responseBodyShouldNotContain(String fragment) {
        String body = BddWorld.apiExecutionResult().bodyAsString();
        if (body.contains(fragment)) {
            throw new AssertionError("Expected response body to not contain: " + fragment);
        }
    }
}
