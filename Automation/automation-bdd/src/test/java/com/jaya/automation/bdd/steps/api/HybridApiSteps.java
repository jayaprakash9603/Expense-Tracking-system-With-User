package com.jaya.automation.bdd.steps.api;

import com.jaya.automation.api.contract.ApiEndpointContract;
import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.api.execution.ApiRequestBuilder;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class HybridApiSteps extends StepDataSupport {
    @Given("api testing is ready")
    public void genericApiExecutorIsReady() {
        BddWorld.apiRequestExecutor();
        BddWorld.apiEndpointRegistry();
        BddWorld.apiResponseValidator();
    }

    @Given("request body {string} is defined as")
    public void apiPayloadAliasIsDefinedAs(String alias, DataTable dataTable) {
        Map<String, Object> payload = objectMap(dataTable);
        BddWorld.putRequestAlias(alias, payload);
        BddWorld.putAliasValue(alias, payload);
    }

    @Given("value {string} is set to {string}")
    public void apiAliasIsSetTo(String alias, String value) {
        String resolvedValue = resolveDynamic(value);
        BddWorld.putAliasValue(alias, resolvedValue);
    }

    @Given("the user is logged in with test credentials")
    public void apiSessionTokenIsGeneratedFromConfiguredCredentials() {
        String token = BddWorld.sessionTokenHelper().signInWithConfiguredUser();
        BddWorld.setJwtToken(token);
        BddWorld.putAliasValue("jwt", token);
    }

    @When("the user sends a {word} request to {string}")
    public void clientSendsRequestToEndpoint(String method, String endpointKey) {
        ApiRequest request = ApiRequest.of(endpointKey);
        execute(method, request);
    }

    @When("the user sends a {word} request to {string} using request body {string}")
    public void clientSendsRequestToEndpointWithPayloadAlias(String method, String endpointKey, String payloadAlias) {
        Map<String, Object> payload = BddWorld.scenarioState()
                .requestAlias(payloadAlias)
                .orElseThrow(() -> new IllegalArgumentException("Unknown payload alias: " + payloadAlias));
        ApiRequest request = ApiRequestBuilder.forEndpoint(endpointKey).body(payload).build();
        execute(method, request);
    }

    @When("the user sends a {word} request to {string} with data")
    public void clientSendsRequestToEndpointWithData(String method, String endpointKey, DataTable dataTable) {
        Map<String, String> data = textMap(dataTable);
        ApiRequest request = buildRequest(endpointKey, data);
        execute(method, request);
    }

    @Then("the response status should be {int}")
    public void apiResponseStatusShouldBe(int expectedStatus) {
        BddWorld.apiResponseValidator().assertStatus(BddWorld.apiExecutionResult(), expectedStatus);
    }

    @Then("the request should succeed")
    public void apiResponseShouldBeSuccessful() {
        BddWorld.apiResponseValidator().assertStatusBetween(BddWorld.apiExecutionResult(), 200, 299);
    }

    @Then("the response should indicate unauthorized access")
    public void apiResponseShouldBeUnauthorized() {
        BddWorld.apiResponseValidator().assertStatus(BddWorld.apiExecutionResult(), 401);
    }

    @Then("the response should indicate forbidden access")
    public void apiResponseShouldBeForbidden() {
        BddWorld.apiResponseValidator().assertStatus(BddWorld.apiExecutionResult(), 403);
    }

    @Then("the response should indicate a bad request")
    public void apiResponseShouldBeBadRequest() {
        BddWorld.apiResponseValidator().assertStatus(BddWorld.apiExecutionResult(), 400);
    }

    @Then("the response status should be one of {string}")
    public void apiResponseStatusShouldBeOneOf(String expectedStatuses) {
        List<Integer> statuses = Arrays.stream(expectedStatuses.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(Integer::parseInt)
                .toList();
        BddWorld.apiResponseValidator().assertStatusIn(BddWorld.apiExecutionResult(), statuses);
    }

    @Then("the response field {string} should equal {string}")
    public void apiResponseAtShouldEqual(String jsonPath, String expectedValue) {
        BddWorld.apiResponseValidator().assertJsonPathEquals(
                BddWorld.apiExecutionResult(),
                jsonPath,
                resolveDynamic(expectedValue)
        );
    }

    @Then("the response field {string} should contain {string}")
    public void apiResponseAtShouldContain(String jsonPath, String expectedFragment) {
        BddWorld.apiResponseValidator().assertJsonPathContains(
                BddWorld.apiExecutionResult(),
                jsonPath,
                resolveDynamic(expectedFragment)
        );
    }

    @Then("the response field {string} should be present")
    public void apiResponseAtShouldBePresent(String jsonPath) {
        BddWorld.apiResponseValidator().assertJsonPathNotNull(BddWorld.apiExecutionResult(), jsonPath);
    }

    @Then("the response list {string} should have size {int}")
    public void apiResponseListAtShouldHaveSize(String jsonPath, int expectedSize) {
        BddWorld.apiResponseValidator().assertJsonArraySize(BddWorld.apiExecutionResult(), jsonPath, expectedSize);
    }

    @Then("the response list {string} should have at least {int} items")
    public void apiResponseListAtShouldHaveAtLeastItems(String jsonPath, int expectedSize) {
        BddWorld.apiResponseValidator().assertJsonArrayMinSize(BddWorld.apiExecutionResult(), jsonPath, expectedSize);
    }

    @Then("the response list {string} should contain {string}")
    public void apiResponseListAtShouldContain(String jsonPath, String expectedFragment) {
        BddWorld.apiResponseValidator().assertJsonArrayContains(
                BddWorld.apiExecutionResult(),
                jsonPath,
                resolveDynamic(expectedFragment)
        );
    }

    @Then("store response field {string} as {string}")
    public void saveApiResponseAtAsAlias(String jsonPath, String alias) {
        Object value = BddWorld.apiExecutionResult().jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        BddWorld.putAliasValue(alias, value);
        if (alias.toLowerCase().contains("jwt")) {
            BddWorld.setJwtToken(String.valueOf(value));
        }
    }

    @Then("store response body as {string}")
    public void saveApiResponseBodyAsAlias(String alias) {
        String bodyText = BddWorld.apiExecutionResult().bodyAsString();
        BddWorld.putAliasValue(alias, bodyText);
    }

    private ApiRequest buildRequest(String endpointKey, Map<String, String> inputData) {
        ApiRequestBuilder requestBuilder = ApiRequestBuilder.forEndpoint(endpointKey);
        Map<String, Object> payload = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : inputData.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue();
            if (key.startsWith("path.")) {
                requestBuilder.pathParam(key.substring(5), value);
                continue;
            }
            if (key.startsWith("query.")) {
                requestBuilder.queryParam(key.substring(6), value);
                continue;
            }
            if (key.startsWith("header.")) {
                requestBuilder.header(key.substring(7), value);
                continue;
            }
            payload.put(key, toBodyValue(value));
        }
        if (!payload.isEmpty()) {
            requestBuilder.body(payload);
        }
        return requestBuilder.build();
    }

    private Object toBodyValue(String value) {
        if ("true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) {
            return Boolean.parseBoolean(value);
        }
        if (value.matches("-?\\d+")) {
            return Integer.parseInt(value);
        }
        if (value.matches("-?\\d+\\.\\d+")) {
            return Double.parseDouble(value);
        }
        return value;
    }

    private void execute(String method, ApiRequest request) {
        ApiEndpointContract contract = BddWorld.apiEndpointRegistry().require(request.endpointKey());
        validateHttpMethod(method, contract);
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, jwtToken());
        BddWorld.setApiExecutionResult(result);
        BddWorld.putResponseAlias("last", result);
        BddWorld.putAliasValue("response.status", result.statusCode());
        BddWorld.putAliasValue("response.body", result.bodyAsString());
        BddWorld.putAliasValue("response.endpoint", request.endpointKey());
    }

    private String jwtToken() {
        try {
            return BddWorld.jwtToken();
        } catch (Exception exception) {
            return "";
        }
    }

    private void validateHttpMethod(String method, ApiEndpointContract contract) {
        String expectedMethod = contract.method().name();
        if (!expectedMethod.equalsIgnoreCase(method)) {
            throw new IllegalArgumentException("Endpoint " + contract.key() + " expects " + expectedMethod
                    + " but step requested " + method);
        }
    }
}
