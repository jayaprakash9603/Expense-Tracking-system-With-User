package com.jaya.automation.api.execution;

import java.util.LinkedHashMap;
import java.util.Map;

public final class ApiRequestBuilder {
    private final String endpointKey;
    private final Map<String, String> pathParams = new LinkedHashMap<>();
    private final Map<String, String> queryParams = new LinkedHashMap<>();
    private final Map<String, String> headers = new LinkedHashMap<>();
    private Object body;

    private ApiRequestBuilder(String endpointKey) {
        this.endpointKey = endpointKey;
    }

    public static ApiRequestBuilder forEndpoint(String endpointKey) {
        return new ApiRequestBuilder(endpointKey);
    }

    public ApiRequestBuilder pathParam(String key, String value) {
        pathParams.put(key, value);
        return this;
    }

    public ApiRequestBuilder queryParam(String key, String value) {
        queryParams.put(key, value);
        return this;
    }

    public ApiRequestBuilder header(String key, String value) {
        headers.put(key, value);
        return this;
    }

    public ApiRequestBuilder body(Object body) {
        this.body = body;
        return this;
    }

    public ApiRequest build() {
        return new ApiRequest(endpointKey, Map.copyOf(pathParams), Map.copyOf(queryParams), Map.copyOf(headers), body);
    }
}
