package com.jaya.automation.bdd.handler;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.api.execution.ApiRequestBuilder;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.core.context.TestContext;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.util.Map;
import java.util.Optional;

/**
 * Abstract base for API handler classes.
 * <p>
 * Follows the company test-automation handler pattern:
 * <ul>
 * <li>Wraps {@link com.jaya.automation.api.execution.ApiRequestExecutor} with
 * response validation, automatic context enrichment, and retry support</li>
 * <li>Each domain handler overrides template methods for domain-specific
 * behavior</li>
 * </ul>
 */
public abstract class BaseApiHandler {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(BaseApiHandler.class);

    private static final int DEFAULT_MAX_RETRIES = 3;
    private static final long DEFAULT_RETRY_DELAY_MS = 2000L;

    // ── Core API execution ──

    protected ApiExecutionResult execute(ApiRequest request) {
        String token = BddWorld.jwtToken();
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, token);
        BddWorld.setApiExecutionResult(result);
        return result;
    }

    protected ApiExecutionResult execute(ApiRequest request, String jwtToken) {
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, jwtToken);
        BddWorld.setApiExecutionResult(result);
        return result;
    }

    // ── Response validation ──

    protected void assertStatus(ApiExecutionResult result, int expectedStatus) {
        int actual = result.statusCode();
        if (actual != expectedStatus) {
            throw new AssertionError(
                    String.format("Expected status %d for [%s] but got %d. Body: %s",
                            expectedStatus, result.endpointKey(), actual, truncateBody(result)));
        }
    }

    protected void assertStatusIn(ApiExecutionResult result, int... acceptableStatuses) {
        int actual = result.statusCode();
        for (int s : acceptableStatuses) {
            if (actual == s)
                return;
        }
        throw new AssertionError(
                String.format("Expected one of %s for [%s] but got %d. Body: %s",
                        java.util.Arrays.toString(acceptableStatuses),
                        result.endpointKey(), actual, truncateBody(result)));
    }

    // ── Context enrichment ──

    protected void storeInContext(TestContext context, String key, ApiExecutionResult result, String jsonPath) {
        Optional<Object> value = result.jsonPathValue(jsonPath);
        value.ifPresent(v -> context.scenarioContext().put(key, v.toString()));
    }

    protected void storeAlias(String aliasKey, ApiExecutionResult result, String jsonPath) {
        result.jsonPathValue(jsonPath)
                .ifPresent(v -> BddWorld.putAliasValue(aliasKey, v.toString()));
    }

    // ── Retry support ──

    protected ApiExecutionResult executeWithRetry(ApiRequest request, int expectedStatus) {
        return executeWithRetry(request, expectedStatus, DEFAULT_MAX_RETRIES, DEFAULT_RETRY_DELAY_MS);
    }

    protected ApiExecutionResult executeWithRetry(ApiRequest request, int expectedStatus,
            int maxRetries, long retryDelayMs) {
        ApiExecutionResult result = null;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            result = execute(request);
            if (result.statusCode() == expectedStatus) {
                return result;
            }
            LOG.warn("Attempt {}/{} for [{}] returned status {} (expected {})",
                    attempt, maxRetries, request.endpointKey(), result.statusCode(), expectedStatus);
            if (attempt < maxRetries) {
                sleep(retryDelayMs);
            }
        }
        assertStatus(result, expectedStatus);
        return result;
    }

    /**
     * Poll an endpoint until a JSON path field matches the expected value.
     * Pattern reference: company ManageOrderHandler.checkOrderStatus()
     */
    protected ApiExecutionResult pollUntil(ApiRequest request, String jsonPath,
            String expectedValue, int maxWaitSeconds) {
        long deadline = System.currentTimeMillis() + (maxWaitSeconds * 1000L);
        ApiExecutionResult result = null;
        while (System.currentTimeMillis() < deadline) {
            result = execute(request);
            if (result.statusCode() == 200) {
                Optional<Object> actual = result.jsonPathValue(jsonPath);
                if (actual.isPresent() && expectedValue.equals(actual.get().toString())) {
                    LOG.info("Poll succeeded: [{}].{} = '{}'", request.endpointKey(), jsonPath, expectedValue);
                    return result;
                }
            }
            sleep(DEFAULT_RETRY_DELAY_MS);
        }
        throw new AssertionError(
                String.format("Polling [%s] timed out after %ds. Expected %s='%s'. Last status: %d, body: %s",
                        request.endpointKey(), maxWaitSeconds, jsonPath, expectedValue,
                        result != null ? result.statusCode() : -1,
                        result != null ? truncateBody(result) : "N/A"));
    }

    // ── Helpers ──

    protected ApiRequestBuilder builder(String endpointKey) {
        return ApiRequestBuilder.forEndpoint(endpointKey);
    }

    private String truncateBody(ApiExecutionResult result) {
        String body = result.bodyAsString();
        return body.length() > 500 ? body.substring(0, 500) + "..." : body;
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Retry sleep interrupted", e);
        }
    }
}
