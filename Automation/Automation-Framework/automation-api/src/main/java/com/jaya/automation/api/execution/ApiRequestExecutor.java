package com.jaya.automation.api.execution;

import com.jaya.automation.api.config.ApiSpecifications;
import com.jaya.automation.api.contract.ApiEndpointContract;
import com.jaya.automation.api.contract.ApiEndpointRegistry;
import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static io.restassured.RestAssured.given;

public final class ApiRequestExecutor {
    private static final Pattern PATH_PARAM_PATTERN = Pattern.compile("\\{([^}/]+)}");
    private static final String AUTHORIZATION_HEADER = "Authorization";

    private final RequestSpecification requestSpecification;
    private final ApiEndpointRegistry endpointRegistry;

    public ApiRequestExecutor(AutomationConfig automationConfig, ApiEndpointRegistry endpointRegistry) {
        this.requestSpecification = new ApiSpecifications(automationConfig).requestSpec();
        this.endpointRegistry = endpointRegistry;
    }

    public ApiExecutionResult execute(ApiRequest request, String jwtToken) {
        ApiEndpointContract endpointContract = endpointRegistry.require(request.endpointKey());
        ensurePathParams(endpointContract.path(), request.pathParams());
        RequestSpecification preparedRequest = given().spec(requestSpecification);
        preparedRequest.headers(request.headers());
        addAuthorizationHeader(preparedRequest, endpointContract, request.headers(), jwtToken);
        addQueryParams(preparedRequest, request.queryParams());
        addPathParams(preparedRequest, request.pathParams());
        addBody(preparedRequest, request.body());
        Response response = preparedRequest.when().request(endpointContract.method().name(), endpointContract.path());
        return new ApiExecutionResult(request.endpointKey(), endpointContract, response);
    }

    private void addAuthorizationHeader(
            RequestSpecification preparedRequest,
            ApiEndpointContract endpointContract,
            Map<String, String> headers,
            String jwtToken
    ) {
        if (headers.containsKey(AUTHORIZATION_HEADER) || !endpointContract.requiresAuthorization()) {
            return;
        }
        if (jwtToken == null || jwtToken.isBlank()) {
            throw new IllegalArgumentException("JWT token is required for endpoint: " + endpointContract.key());
        }
        if (jwtToken.startsWith("Bearer ")) {
            preparedRequest.header(AUTHORIZATION_HEADER, jwtToken);
            return;
        }
        preparedRequest.header(AUTHORIZATION_HEADER, "Bearer " + jwtToken);
    }

    private void addQueryParams(RequestSpecification preparedRequest, Map<String, String> queryParams) {
        if (!queryParams.isEmpty()) {
            preparedRequest.queryParams(queryParams);
        }
    }

    private void addPathParams(RequestSpecification preparedRequest, Map<String, String> pathParams) {
        if (!pathParams.isEmpty()) {
            preparedRequest.pathParams(pathParams);
        }
    }

    private void addBody(RequestSpecification preparedRequest, Object body) {
        if (body != null) {
            preparedRequest.body(body);
        }
    }

    private void ensurePathParams(String path, Map<String, String> pathParams) {
        Set<String> requiredParams = extractPathParams(path);
        if (requiredParams.isEmpty()) {
            return;
        }
        Set<String> missingParams = new HashSet<>();
        for (String requiredParam : requiredParams) {
            String value = pathParams.get(requiredParam);
            if (value == null || value.isBlank()) {
                missingParams.add(requiredParam);
            }
        }
        if (!missingParams.isEmpty()) {
            throw new IllegalArgumentException("Missing path params for " + path + ": " + missingParams);
        }
    }

    private Set<String> extractPathParams(String path) {
        Matcher matcher = PATH_PARAM_PATTERN.matcher(path);
        Set<String> pathParams = new HashSet<>();
        while (matcher.find()) {
            pathParams.add(matcher.group(1));
        }
        return pathParams;
    }
}
