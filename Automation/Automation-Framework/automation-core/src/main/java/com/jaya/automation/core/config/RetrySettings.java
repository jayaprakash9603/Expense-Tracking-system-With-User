package com.jaya.automation.core.config;

public record RetrySettings(int maxRetries, int rerunFailedCount) {
}
