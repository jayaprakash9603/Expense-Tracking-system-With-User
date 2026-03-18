package com.jaya.automation.core.util;

import com.jaya.automation.core.config.RetryPolicy;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;

import java.util.function.Predicate;

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
        throw new IllegalStateException("Operation failed after " + attempts + " attempts", lastFailure);
    }

    public static void executeVoid(CheckedRunnable action, int maxAttempts) {
        execute(() -> {
            action.run();
            return null;
        }, maxAttempts);
    }

    public static <T> T executeWithBackoff(CheckedSupplier<T> supplier, RetryPolicy policy) {
        int attempts = Math.max(1, policy.maxAttempts());
        Exception lastFailure = null;
        for (int currentAttempt = 1; currentAttempt <= attempts; currentAttempt++) {
            try {
                return supplier.get();
            } catch (Exception ex) {
                lastFailure = ex;
                if (currentAttempt < attempts) {
                    long delay = policy.delayForAttempt(currentAttempt);
                    LOG.warn("Attempt {}/{} failed, retrying in {}ms: {}", currentAttempt, attempts, delay, ex.getMessage());
                    sleepQuietly(delay);
                }
            }
        }
        throw new IllegalStateException("Operation failed after " + attempts + " attempts with backoff", lastFailure);
    }

    public static void executeVoidWithBackoff(CheckedRunnable action, RetryPolicy policy) {
        executeWithBackoff(() -> {
            action.run();
            return null;
        }, policy);
    }

    public static <T> T executeWithPredicate(
            CheckedSupplier<T> supplier,
            Predicate<T> successCondition,
            int maxAttempts,
            long delayMs
    ) {
        int attempts = Math.max(1, maxAttempts);
        Exception lastFailure = null;
        T lastResult = null;
        for (int currentAttempt = 1; currentAttempt <= attempts; currentAttempt++) {
            try {
                lastResult = supplier.get();
                if (successCondition.test(lastResult)) {
                    return lastResult;
                }
                if (currentAttempt < attempts) {
                    LOG.debug("Predicate not satisfied on attempt {}/{}, retrying in {}ms", currentAttempt, attempts, delayMs);
                    sleepQuietly(delayMs);
                }
            } catch (Exception ex) {
                lastFailure = ex;
                if (currentAttempt < attempts) {
                    LOG.warn("Attempt {}/{} threw exception, retrying in {}ms: {}", currentAttempt, attempts, delayMs, ex.getMessage());
                    sleepQuietly(delayMs);
                }
            }
        }
        if (lastFailure != null) {
            throw new IllegalStateException("Predicate-based retry failed after " + attempts + " attempts", lastFailure);
        }
        return lastResult;
    }

    private static void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Retry interrupted", ie);
        }
    }
}
