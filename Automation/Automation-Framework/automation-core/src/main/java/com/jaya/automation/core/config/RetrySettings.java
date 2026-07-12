package com.jaya.automation.core.config;

public record RetrySettings(
        int maxRetries,
        int rerunFailedCount,
        RetryPolicy apiRetryPolicy,
        RetryPolicy uiPollRetryPolicy
) {
    public RetrySettings(int maxRetries, int rerunFailedCount) {
        this(maxRetries, rerunFailedCount, RetryPolicy.defaults(), RetryPolicy.defaults());
    }
}
