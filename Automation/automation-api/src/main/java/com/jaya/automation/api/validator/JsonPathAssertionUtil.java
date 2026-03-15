package com.jaya.automation.api.validator;

import com.jaya.automation.api.execution.ApiExecutionResult;

import java.util.Objects;

public final class JsonPathAssertionUtil {
    public void assertValueEquals(ApiExecutionResult result, String jsonPath, String expectedValue) {
        Object actualValue = result.jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        if (!Objects.equals(String.valueOf(actualValue), expectedValue)) {
            throw new AssertionError("Expected " + jsonPath + " to equal " + expectedValue + " but was " + actualValue);
        }
    }

    public void assertValueContains(ApiExecutionResult result, String jsonPath, String expectedFragment) {
        Object actualValue = result.jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        String actualText = String.valueOf(actualValue);
        if (!actualText.contains(expectedFragment)) {
            throw new AssertionError("Expected " + jsonPath + " to contain " + expectedFragment + " but was " + actualText);
        }
    }

    public void assertValuePresent(ApiExecutionResult result, String jsonPath) {
        Object actualValue = result.jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        if (actualValue == null) {
            throw new AssertionError("Expected non-null json path value: " + jsonPath);
        }
    }
}
