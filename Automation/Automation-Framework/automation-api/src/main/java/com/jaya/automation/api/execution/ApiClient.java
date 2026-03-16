package com.jaya.automation.api.execution;

public final class ApiClient {
    private final ApiRequestExecutor requestExecutor;

    public ApiClient(ApiRequestExecutor requestExecutor) {
        this.requestExecutor = requestExecutor;
    }

    public ApiExecutionResult send(ApiRequest request, String jwtToken) {
        return requestExecutor.execute(request, jwtToken);
    }
}
