package com.jaya.automation.api.execution;

import com.jaya.automation.api.contract.ApiEndpointContract;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;

import java.util.Optional;

public record ApiExecutionResult(
        String endpointKey,
        ApiEndpointContract endpointContract,
        Response response
) {
    public int statusCode() {
        return response.statusCode();
    }

    public String bodyAsString() {
        return response.body().asString();
    }

    public Optional<Object> jsonPathValue(String jsonPath) {
        try {
            JsonPath path = response.jsonPath();
            return Optional.ofNullable(path.get(jsonPath));
        } catch (Exception exception) {
            return Optional.empty();
        }
    }
}
