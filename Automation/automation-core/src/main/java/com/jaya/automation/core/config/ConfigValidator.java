package com.jaya.automation.core.config;

import java.net.URI;
import java.net.URISyntaxException;

public final class ConfigValidator {
    private ConfigValidator() {
    }

    public static AutomationConfig validate(AutomationConfig config) {
        requirePositive(config.explicitWait().toSeconds(), "EXPLICIT_WAIT_SEC");
        requireNonNegative(config.retrySettings().maxRetries(), "RETRY_COUNT");
        requireNonNegative(config.retrySettings().rerunFailedCount(), "RERUN_FAILED_COUNT");
        requirePositive(config.runnerSettings().parallelThreads(), "cucumber.thread.count");
        requirePositive(config.dataSettings().partitions(), "DATA_PARTITIONS");
        requireNonNegative(config.dataSettings().partitionIndex(), "DATA_PARTITION_INDEX");
        requireNonNegative(config.dataSettings().iteration(), "DATA_ITERATION");
        requireUrl(config.baseUrl(), "BASE_URL");
        requireUrl(config.apiBaseUrl(), "API_BASE_URL");
        requireOptionalUrl(config.appBootstrapSettings().readyUrl(), "APP_READY_URL");
        validatePartitionIndex(config.dataSettings().partitionIndex(), config.dataSettings().partitions());
        return config;
    }

    private static void requirePositive(long value, String key) {
        if (value <= 0) {
            throw new IllegalArgumentException(key + " must be greater than zero");
        }
    }

    private static void requireNonNegative(int value, String key) {
        if (value < 0) {
            throw new IllegalArgumentException(key + " must not be negative");
        }
    }

    private static void validatePartitionIndex(int index, int partitions) {
        if (index >= partitions) {
            throw new IllegalArgumentException("DATA_PARTITION_INDEX must be less than DATA_PARTITIONS");
        }
    }

    private static void requireOptionalUrl(String value, String key) {
        if (value == null || value.isBlank()) {
            return;
        }
        requireUrl(value, key);
    }

    private static void requireUrl(String value, String key) {
        try {
            URI uri = new URI(value);
            if (uri.getScheme() == null || uri.getHost() == null) {
                throw new IllegalArgumentException(key + " must be a valid absolute URL");
            }
        } catch (URISyntaxException ex) {
            throw new IllegalArgumentException(key + " must be a valid absolute URL", ex);
        }
    }
}
