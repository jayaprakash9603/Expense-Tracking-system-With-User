package com.jaya.automation.bdd.steps.api;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.Assertions;

import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ScenarioIdApiSteps extends StepDataSupport {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(ScenarioIdApiSteps.class);

    @Given("api testing is ready for scenarioID {string}")
    public void apiReadyForScenarioId(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.apiRequestExecutor();
        BddWorld.apiEndpointRegistry();
        BddWorld.apiResponseValidator();
        BddWorld.apiScenarioContext();
        BddWorld.tokenProvider();
        BddWorld.putScopedValue(scenarioId, "api.ready", Boolean.TRUE);
        LOG.info("API testing initialized for scenarioID: {}", scenarioId);
    }

    @Given("the user is logged in with test credentials for scenarioID {string}")
    public void loginForScenarioId(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String token = BddWorld.sessionTokenHelper().signInWithConfiguredUser();
        BddWorld.setJwtToken(token);
        BddWorld.apiScenarioContext().putTokenAlias("user", token);
        BddWorld.apiScenarioContext().setActiveTokenAlias("user");
        BddWorld.putScopedValue(scenarioId, "jwt", token);
        BddWorld.putAliasValue("jwt", token);
        LOG.info("API session token generated for scenarioID: {}", scenarioId);
    }

    @Given("request body {string} is defined as for scenarioID {string}")
    public void definePayloadForScenarioId(String alias, String scenarioId, DataTable dataTable) {
        BddWorld.registerScenarioId(scenarioId);
        Map<String, Object> payload = objectMap(dataTable);
        String scopedAlias = scenarioId + "." + alias;
        BddWorld.apiScenarioContext().putRequestAlias(alias, payload);
        BddWorld.putRequestAlias(alias, payload);
        BddWorld.putScopedValue(scenarioId, "request." + alias, payload);
        BddWorld.putAliasValue(scopedAlias, payload);
        LOG.info("Payload alias '{}' defined for scenarioID: {}", alias, scenarioId);
    }

    @Given("value {string} is set to {string} for scenarioID {string}")
    public void setValueForScenarioId(String alias, String value, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String resolvedValue = resolveDynamic(value);
        BddWorld.apiScenarioContext().putAlias(alias, resolvedValue);
        BddWorld.putScopedValue(scenarioId, alias, resolvedValue);
        BddWorld.putAliasValue(alias, resolvedValue);
    }

    @Then("store response field {string} as {string} for scenarioID {string}")
    public void storeResponseFieldForScenarioId(String jsonPath, String alias, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        Object value = BddWorld.apiExecutionResult().jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        BddWorld.apiScenarioContext().putAlias(alias, value);
        BddWorld.putScopedValue(scenarioId, alias, value);
        BddWorld.putAliasValue(alias, value);
        if (alias.toLowerCase().contains("jwt")) {
            BddWorld.setJwtToken(String.valueOf(value));
        }
        LOG.info("Stored response field '{}' as '{}' for scenarioID: {}", jsonPath, alias, scenarioId);
    }

    @Then("the response status should be {int} for scenarioID {string}")
    public void verifyStatusForScenarioId(int expectedStatus, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.apiResponseValidator().assertStatus(BddWorld.apiExecutionResult(), expectedStatus);
        BddWorld.putScopedValue(scenarioId, "response.status", expectedStatus);
    }

    @Then("the response field {string} should equal {string} for scenarioID {string}")
    public void verifyFieldForScenarioId(String jsonPath, String expectedValue, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.apiResponseValidator().assertJsonPathEquals(
                BddWorld.apiExecutionResult(),
                jsonPath,
                resolveDynamic(expectedValue));
    }

    @Then("the response field {string} should contain {string} for scenarioID {string}")
    public void verifyFieldContainsForScenarioId(String jsonPath, String expectedFragment, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.apiResponseValidator().assertJsonPathContains(
                BddWorld.apiExecutionResult(),
                jsonPath,
                resolveDynamic(expectedFragment));
    }

    @When("I want to wait for {int} seconds for API scenarioID {string}")
    public void apiWaitForScenarioId(int seconds, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        LOG.info("Waiting {} seconds for API scenarioID: {}", seconds, scenarioId);
        try {
            Thread.sleep(seconds * 1000L);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Wait interrupted for scenarioID: " + scenarioId, ex);
        }
    }

    @Then("the scoped value {string} for scenarioID {string} should equal {string}")
    public void verifyScopedValueForScenarioId(String key, String scenarioId, String expectedValue) {
        Object actual = BddWorld.scopedValue(scenarioId, key)
                .orElseThrow(
                        () -> new AssertionError("No scoped value for key '" + key + "' in scenarioID: " + scenarioId));
        Assertions.assertThat(String.valueOf(actual))
                .as("Scoped value '%s' for scenarioID '%s'", key, scenarioId)
                .isEqualTo(resolveDynamic(expectedValue));
    }
}
