package com.jaya.automation.api.execution;

import java.util.Map;

public record ApiRequest(
        String endpointKey,
        Map<String, String> pathParams,
        Map<String, String> queryParams,
        Map<String, String> headers,
        Object body
) {
    public static ApiRequest of(String endpointKey) {
        return new ApiRequest(endpointKey, Map.of(), Map.of(), Map.of(), null);
    }
}
