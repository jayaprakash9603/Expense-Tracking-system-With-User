package com.jaya.automation.api.contract;

public record ApiEndpointContract(
        String key,
        ApiHttpMethod method,
        String path,
        boolean requiresAuthorization
) {
}
