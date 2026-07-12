package com.jaya.automation.core.config;

import java.time.Duration;

public record HttpClientSettings(
        Duration connectTimeout,
        Duration readTimeout,
        Duration writeTimeout,
        int connectionPoolSize,
        Duration sleepTimeout,
        int maxRetries
) {
    private static final int DEFAULT_TIMEOUT_SEC = 30;
    private static final int DEFAULT_POOL_SIZE = 50;
    private static final int DEFAULT_SLEEP_TIMEOUT_MS = 30_000;
    private static final int DEFAULT_MAX_RETRIES = 5;

    public static HttpClientSettings defaults() {
        return new HttpClientSettings(
                Duration.ofSeconds(DEFAULT_TIMEOUT_SEC),
                Duration.ofSeconds(DEFAULT_TIMEOUT_SEC),
                Duration.ofSeconds(DEFAULT_TIMEOUT_SEC),
                DEFAULT_POOL_SIZE,
                Duration.ofMillis(DEFAULT_SLEEP_TIMEOUT_MS),
                DEFAULT_MAX_RETRIES
        );
    }

    public long connectTimeoutMs() {
        return connectTimeout.toMillis();
    }

    public long readTimeoutMs() {
        return readTimeout.toMillis();
    }

    public long writeTimeoutMs() {
        return writeTimeout.toMillis();
    }

    public long sleepTimeoutMs() {
        return sleepTimeout.toMillis();
    }
}
