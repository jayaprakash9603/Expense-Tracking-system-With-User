package com.jaya.automation.core.config;

import java.util.Locale;

public enum EnvironmentType {
    LOCAL,
    QA,
    STAGE,
    PROD;

    public static EnvironmentType from(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return LOCAL;
        }
        String normalized = rawValue.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "LOCAL" -> LOCAL;
            case "QA" -> QA;
            case "STAGE" -> STAGE;
            case "PROD" -> PROD;
            default -> throw new IllegalArgumentException("Unsupported TEST_ENV: " + rawValue);
        };
    }
}
