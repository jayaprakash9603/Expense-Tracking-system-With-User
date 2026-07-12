package com.jaya.automation.core.config;

import java.time.Duration;

public record RetryPolicy(
        int maxAttempts,
        Duration initialDelay,
        double backoffMultiplier,
        Duration maxDelay
) {
    private static final int DEFAULT_MAX_ATTEMPTS = 3;
    private static final Duration DEFAULT_INITIAL_DELAY = Duration.ofSeconds(2);
    private static final double DEFAULT_MULTIPLIER = 1.5;
    private static final Duration DEFAULT_MAX_DELAY = Duration.ofSeconds(30);

    public static RetryPolicy defaults() {
        return new RetryPolicy(DEFAULT_MAX_ATTEMPTS, DEFAULT_INITIAL_DELAY, DEFAULT_MULTIPLIER, DEFAULT_MAX_DELAY);
    }

    public long initialDelayMs() {
        return initialDelay.toMillis();
    }

    public long maxDelayMs() {
        return maxDelay.toMillis();
    }

    public long delayForAttempt(int attempt) {
        long delay = (long) (initialDelay.toMillis() * Math.pow(backoffMultiplier, attempt - 1));
        return Math.min(delay, maxDelay.toMillis());
    }
}
