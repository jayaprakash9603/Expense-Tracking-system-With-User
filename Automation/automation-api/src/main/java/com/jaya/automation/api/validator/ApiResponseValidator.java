package com.jaya.automation.api.validator;

import com.jaya.automation.api.execution.ApiExecutionResult;

import java.util.Collection;
import java.util.Objects;

public final class ApiResponseValidator {
    public void assertStatus(ApiExecutionResult result, int expectedStatus) {
        int actualStatus = result.statusCode();
        if (actualStatus != expectedStatus) {
            throw new AssertionError("Expected status " + expectedStatus + " but was " + actualStatus);
        }
    }

    public void assertStatusIn(ApiExecutionResult result, Collection<Integer> expectedStatuses) {
        int actualStatus = result.statusCode();
        if (!expectedStatuses.contains(actualStatus)) {
            throw new AssertionError("Expected status in " + expectedStatuses + " but was " + actualStatus);
        }
    }

    public void assertStatusBetween(ApiExecutionResult result, int minStatus, int maxStatus) {
        int actualStatus = result.statusCode();
        if (actualStatus < minStatus || actualStatus > maxStatus) {
            throw new AssertionError("Expected status between " + minStatus + " and " + maxStatus + " but was "
                    + actualStatus);
        }
    }

    public void assertJsonPathEquals(ApiExecutionResult result, String jsonPath, String expectedValue) {
        Object actualValue = result.jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        if (!Objects.equals(String.valueOf(actualValue), expectedValue)) {
            throw new AssertionError("Expected " + jsonPath + " to equal " + expectedValue + " but was " + actualValue);
        }
    }

    public void assertJsonPathContains(ApiExecutionResult result, String jsonPath, String expectedFragment) {
        Object actualValue = result.jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        String actualText = String.valueOf(actualValue);
        if (!actualText.contains(expectedFragment)) {
            throw new AssertionError("Expected " + jsonPath + " to contain " + expectedFragment + " but was " + actualText);
        }
    }

    public void assertJsonPathNotNull(ApiExecutionResult result, String jsonPath) {
        Object actualValue = result.jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        if (actualValue == null) {
            throw new AssertionError("Expected non-null json path value: " + jsonPath);
        }
    }

    public void assertJsonArraySize(ApiExecutionResult result, String jsonPath, int expectedSize) {
        Object value = result.jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        if (!(value instanceof Collection<?> collection)) {
            throw new AssertionError("Expected collection at json path " + jsonPath + " but got " + value);
        }
        int actualSize = collection.size();
        if (actualSize != expectedSize) {
            throw new AssertionError("Expected size " + expectedSize + " but was " + actualSize);
        }
    }

    public void assertJsonArrayMinSize(ApiExecutionResult result, String jsonPath, int minimumSize) {
        Object value = result.jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        if (!(value instanceof Collection<?> collection)) {
            throw new AssertionError("Expected collection at json path " + jsonPath + " but got " + value);
        }
        int actualSize = collection.size();
        if (actualSize < minimumSize) {
            throw new AssertionError("Expected size >= " + minimumSize + " but was " + actualSize);
        }
    }

    public void assertJsonArrayContains(ApiExecutionResult result, String jsonPath, String expectedFragment) {
        Object value = result.jsonPathValue(jsonPath)
                .orElseThrow(() -> new AssertionError("Missing json path: " + jsonPath));
        if (!(value instanceof Collection<?> collection)) {
            throw new AssertionError("Expected collection at json path " + jsonPath + " but got " + value);
        }
        boolean matchFound = collection.stream()
                .map(String::valueOf)
                .anyMatch(entry -> entry.contains(expectedFragment));
        if (!matchFound) {
            throw new AssertionError("Expected collection at " + jsonPath + " to contain " + expectedFragment);
        }
    }
}
