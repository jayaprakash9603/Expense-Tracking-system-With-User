package com.jaya.automation.core.util;

import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

public final class RetryExecutor {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(RetryExecutor.class);

    private RetryExecutor() {
    }

    public static <T> T execute(CheckedSupplier<T> supplier, int maxAttempts) {
        int attempts = Math.max(1, maxAttempts);
        Exception lastFailure = null;
        for (int currentAttempt = 1; currentAttempt <= attempts; currentAttempt++) {
            try {
                return supplier.get();
            } catch (Exception ex) {
                lastFailure = ex;
                if (currentAttempt < attempts) {
                    LOG.warn("Retry attempt {}/{} failed: {}", currentAttempt, attempts, ex.getMessage());
                }
            }
        }
        throw new IllegalStateException("Operation failed after retries", lastFailure);
    }
}
