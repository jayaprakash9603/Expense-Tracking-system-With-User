package com.jaya.automation.core.config;

import java.util.Locale;

public enum AutomationEngine {
    SELENIUM,
    PLAYWRIGHT;

    public static AutomationEngine from(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return SELENIUM;
        }
        String normalized = rawValue.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "SELENIUM" -> SELENIUM;
            case "PLAYWRIGHT" -> PLAYWRIGHT;
            default -> throw new IllegalArgumentException("Unsupported AUTOMATION_ENGINE: " + rawValue);
        };
    }
}
