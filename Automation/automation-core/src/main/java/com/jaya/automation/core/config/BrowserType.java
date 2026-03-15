package com.jaya.automation.core.config;

import java.util.Locale;

public enum BrowserType {
    CHROME,
    EDGE,
    FIREFOX;

    public static BrowserType from(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return CHROME;
        }
        String normalized = rawValue.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "CHROME" -> CHROME;
            case "EDGE" -> EDGE;
            case "FIREFOX" -> FIREFOX;
            default -> throw new IllegalArgumentException("Unsupported BROWSER: " + rawValue);
        };
    }
}
