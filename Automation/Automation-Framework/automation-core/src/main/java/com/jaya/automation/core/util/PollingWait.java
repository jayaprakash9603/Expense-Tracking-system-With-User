package com.jaya.automation.core.util;

import java.time.Duration;
import java.time.Instant;
import java.util.function.BooleanSupplier;

public final class PollingWait {
    private PollingWait() {
    }

    public static void until(BooleanSupplier condition, Duration timeout, Duration pollInterval, String errorMessage) {
        Instant deadline = Instant.now().plus(timeout);
        while (Instant.now().isBefore(deadline)) {
            if (condition.getAsBoolean()) {
                return;
            }
            sleep(pollInterval);
        }
        throw new IllegalStateException(errorMessage);
    }

    private static void sleep(Duration pollInterval) {
        try {
            Thread.sleep(pollInterval.toMillis());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Wait interrupted", ex);
        }
    }
}
