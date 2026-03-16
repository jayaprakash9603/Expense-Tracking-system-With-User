package com.jaya.automation.bdd.steps.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.automation.api.contract.ApiEndpointContract;
import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.api.execution.ApiRequestBuilder;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.ResourceResolver;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import java.io.InputStream;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class GenericApiSteps extends StepDataSupport {
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<String, Integer> STATUS_LABELS = Map.ofEntries(
            Map.entry("success", 200),
            Map.entry("resource created", 201),
            Map.entry("no content", 204),
            Map.entry("a bad request", 400),
            Map.entry("bad request", 400),
            Map.entry("unauthorized access", 401),
            Map.entry("unauthorized", 401),
            Map.entry("forbidden access", 403),
            Map.entry("forbidden", 403),
            Map.entry("not found", 404),
            Map.entry("a conflict", 409),
            Map.entry("conflict", 409),
            Map.entry("server error", 500)
    );

    @Given("api testing is ready")
    public void genericApiExecutorIsReady() {
        BddWorld.apiRequestExecutor();
        BddWorld.apiEndpointRegistry();
        BddWorld.apiResponseValidator();
        BddWorld.jsonSchemaValidator();
        BddWorld.apiScenarioContext();
        BddWorld.tokenProvider();
    }

    @Given("request body {string} is defined as")
    public void apiPayloadAliasIsDefinedAs(String alias, DataTable dataTable) {
        Map<String, Object> payload = objectMap(dataTable);
        BddWorld.apiScenarioContext().putRequestAlias(alias, payload);
        BddWorld.putRequestAlias(alias, payload);
        BddWorld.putAliasValue(alias, payload);
    }

    @Given("request body {string} is loaded from payload file {string}")
    public void apiPayloadAliasIsLoadedFromFile(String alias, String payloadFile) {
        Map<String, Object> payload = readPayload(payloadFile);
        BddWorld.apiScenarioContext().putRequestAlias(alias, payload);
        BddWorld.putRequestAlias(alias, payload);
        BddWorld.putAliasValue(alias, payload);
    }

    @Given("request body {string} uses the {string} payload")
    public void apiPayloadAliasUsesNamedPayload(String alias, String payloadKey) {
        String resolvedPath = ResourceResolver.resolvePayload(payloadKey);
        apiPayloadAliasIsLoadedFromFile(alias, resolvedPath);
    }

    @Given("value {string} is set to {string}")
    public void apiAliasIsSetTo(String alias, String value) {
        String resolvedValue = resolveDynamic(value);
        BddWorld.apiScenarioContext().putAlias(alias, resolvedValue);
        BddWorld.putAliasValue(alias, resolvedValue);
    }

    @Given("the user is logged in with test credentials")
    public void apiSessionTokenIsGeneratedFromConfiguredCredentials() {
        String token = BddWorld.sessionTokenHelper().signInWithConfiguredUser();
        BddWorld.setJwtToken(token);
        BddWorld.apiScenarioContext().putTokenAlias("user", token);
        BddWorld.apiScenarioContext().setActiveTokenAlias("user");
        BddWorld.putAliasValue("jwt", token);
    }

    @Given("the user uses token alias {string}")
    public void apiTokenAliasIsSelected(String alias) {
        String token = BddWorld.apiScenarioContext().tokenAlias(alias)
                .orElseGet(() -> BddWorld.tokenProvider().token(alias));
        BddWorld.apiScenarioContext().putTokenAlias(alias, token);
        BddWorld.apiScenarioContext().setActiveTokenAlias(alias);
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
        Map<String, Object> payload = requirePayloadAlias(payloadAlias);
        ApiRequest request = ApiRequestBuilder.forEndpoint(endpointKey).body(payload).build();
        execute(method, request);
    }

    @When("the user sends a {word} request to {string} with data")
    public void clientSendsRequestToEndpointWithData(String method, String endpointKey, DataTable dataTable) {
        ApiRequest request = buildRequest(endpointKey, textMap(dataTable), new LinkedHashMap<>());
        execute(method, request);
    }

    @When("the user sends a {word} request to {string} using request body {string} with data")
    public void clientSendsRequestToEndpointWithPayloadAliasAndData(
            String method,
            String endpointKey,
            String payloadAlias,
            DataTable dataTable
    ) {
        Map<String, Object> payload = new LinkedHashMap<>(requirePayloadAlias(payloadAlias));
        ApiRequest request = buildRequest(endpointKey, textMap(dataTable), payload);
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

    @Then("the response should indicate {string}")
    public void apiResponseShouldIndicateStatus(String statusLabel) {
        int code = STATUS_LABELS.getOrDefault(statusLabel.toLowerCase().trim(), -1);
        if (code == -1) {
            throw new IllegalArgumentException(
                    "Unknown status label: \"" + statusLabel + "\". Valid labels: " + STATUS_LABELS.keySet());
        }
        BddWorld.apiResponseValidator().assertStatus(BddWorld.apiExecutionResult(), code);
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

    @Then("the response body should equal {string}")
    public void apiResponseBodyShouldEqual(String expectedBody) {
        BddWorld.apiResponseValidator().assertBodyEquals(BddWorld.apiExecutionResult(), resolveDynamic(expectedBody));
    }

    @Then("the response body should contain {string}")
    public void apiResponseBodyShouldContain(String expectedFragment) {
        BddWorld.apiResponseValidator().assertBodyContains(BddWorld.apiExecutionResult(), resolveDynamic(expectedFragment));
    }

    @Then("the response should contain error message {string}")
    public void apiResponseShouldContainErrorMessage(String expectedFragment) {
        String resolvedFragment = resolveDynamic(expectedFragment);
        BddWorld.apiResponseValidator().assertJsonPathOrBodyContains(
                BddWorld.apiExecutionResult(),
                "error",
                resolvedFragment
        );
        if (isJsonPathMissing("error")) {
            BddWorld.apiResponseValidator().assertJsonPathOrBodyContains(
                    BddWorld.apiExecutionResult(),
                    "message",
                    resolvedFragment
            );
        }
    }

    @Then("the response should match schema {string}")
    public void apiResponseShouldMatchSchema(String schemaPath) {
        BddWorld.jsonSchemaValidator().assertSchema(BddWorld.apiExecutionResult(), resolveDynamic(schemaPath));
    }

    @Then("the response should match the {string} schema")
    public void apiResponseShouldMatchNamedSchema(String schemaKey) {
        String resolvedPath = ResourceResolver.resolveSchema(schemaKey);
        apiResponseShouldMatchSchema(resolvedPath);
    }

    @Then("store response field {string} as {string}")
    public void saveApiResponseAtAsAlias(String jsonPath, String alias) {
        Object value = BddWorld.apiExecutionResult().jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        BddWorld.apiScenarioContext().putAlias(alias, value);
        BddWorld.putAliasValue(alias, value);
        if (alias.toLowerCase().contains("jwt")) {
            BddWorld.setJwtToken(String.valueOf(value));
        }
    }

    @Then("store response body as {string}")
    public void saveApiResponseBodyAsAlias(String alias) {
        String bodyText = BddWorld.apiExecutionResult().bodyAsString();
        BddWorld.apiScenarioContext().putAlias(alias, bodyText);
        BddWorld.putAliasValue(alias, bodyText);
    }

    private ApiRequest buildRequest(String endpointKey, Map<String, String> inputData, Map<String, Object> payloadSeed) {
        ApiRequestBuilder requestBuilder = ApiRequestBuilder.forEndpoint(endpointKey);
        Map<String, Object> payload = new LinkedHashMap<>(payloadSeed);
        inputData.forEach((key, value) -> applyValue(requestBuilder, payload, key, value));
        if (!payload.isEmpty()) {
            requestBuilder.body(payload);
        }
        return requestBuilder.build();
    }

    private void applyValue(ApiRequestBuilder requestBuilder, Map<String, Object> payload, String key, String value) {
        if (key.startsWith("path.")) {
            requestBuilder.pathParam(key.substring(5), value);
            return;
        }
        if (key.startsWith("query.")) {
            requestBuilder.queryParam(key.substring(6), value);
            return;
        }
        if (key.startsWith("header.")) {
            requestBuilder.header(key.substring(7), value);
            return;
        }
        payload.put(key, toBodyValue(value));
    }

    private Object toBodyValue(String value) {
        if ("null".equalsIgnoreCase(value)) {
            return null;
        }
        if ("true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) {
            return Boolean.parseBoolean(value);
        }
        if (value.matches("-?\\d+")) {
            return Long.parseLong(value);
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
        BddWorld.apiScenarioContext().putResponseAlias("last", result);
        BddWorld.putResponseAlias("last", result);
        BddWorld.putAliasValue("response.status", result.statusCode());
        BddWorld.putAliasValue("response.body", result.bodyAsString());
        BddWorld.putAliasValue("response.endpoint", request.endpointKey());
    }

    private String jwtToken() {
        Optional<String> activeAlias = BddWorld.apiScenarioContext().activeTokenAlias();
        if (activeAlias.isPresent()) {
            return activeToken(activeAlias.get());
        }
        return existingToken();
    }

    private String activeToken(String alias) {
        Optional<String> cachedToken = BddWorld.apiScenarioContext().tokenAlias(alias);
        if (cachedToken.isPresent()) {
            return cachedToken.get();
        }
        String token = BddWorld.tokenProvider().token(alias);
        BddWorld.apiScenarioContext().putTokenAlias(alias, token);
        return token;
    }

    private String existingToken() {
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

    private Map<String, Object> requirePayloadAlias(String payloadAlias) {
        return BddWorld.apiScenarioContext().requestAlias(payloadAlias)
                .orElseThrow(() -> new IllegalArgumentException("Unknown payload alias: " + payloadAlias));
    }

    private Map<String, Object> readPayload(String payloadFile) {
        try (InputStream stream = resource(payloadFile)) {
            return objectMapper.readValue(stream, new TypeReference<>() {
            });
        } catch (Exception exception) {
            throw new IllegalArgumentException("Unable to read payload file: " + payloadFile, exception);
        }
    }

    private InputStream resource(String payloadFile) {
        String path = payloadFile.startsWith("/") ? payloadFile.substring(1) : payloadFile;
        InputStream stream = Thread.currentThread().getContextClassLoader().getResourceAsStream(path);
        if (stream == null) {
            throw new IllegalArgumentException("Payload file not found: " + payloadFile);
        }
        return stream;
    }

    private boolean isJsonPathMissing(String jsonPath) {
        return BddWorld.apiExecutionResult().jsonPathValue(jsonPath).isEmpty();
    }
}
