package com.jaya.automation.core.ui;

import java.util.Locale;
import java.util.Map;

public final class KeyNames {

    private static final Map<String, String> SELENIUM_KEYS = Map.ofEntries(
            Map.entry("ENTER", "ENTER"),
            Map.entry("RETURN", "ENTER"),
            Map.entry("TAB", "TAB"),
            Map.entry("ESCAPE", "ESCAPE"),
            Map.entry("ESC", "ESCAPE"),
            Map.entry("BACKSPACE", "BACK_SPACE"),
            Map.entry("BACK_SPACE", "BACK_SPACE"),
            Map.entry("DELETE", "DELETE"),
            Map.entry("SPACE", "SPACE"),
            Map.entry("ARROW_UP", "ARROW_UP"),
            Map.entry("UP", "ARROW_UP"),
            Map.entry("ARROW_DOWN", "ARROW_DOWN"),
            Map.entry("DOWN", "ARROW_DOWN"),
            Map.entry("ARROW_LEFT", "ARROW_LEFT"),
            Map.entry("LEFT", "ARROW_LEFT"),
            Map.entry("ARROW_RIGHT", "ARROW_RIGHT"),
            Map.entry("RIGHT", "ARROW_RIGHT"),
            Map.entry("HOME", "HOME"),
            Map.entry("END", "END"),
            Map.entry("PAGE_UP", "PAGE_UP"),
            Map.entry("PAGE_DOWN", "PAGE_DOWN")
    );

    private static final Map<String, String> PLAYWRIGHT_KEYS = Map.ofEntries(
            Map.entry("ENTER", "Enter"),
            Map.entry("RETURN", "Enter"),
            Map.entry("TAB", "Tab"),
            Map.entry("ESCAPE", "Escape"),
            Map.entry("ESC", "Escape"),
            Map.entry("BACKSPACE", "Backspace"),
            Map.entry("BACK_SPACE", "Backspace"),
            Map.entry("DELETE", "Delete"),
            Map.entry("SPACE", " "),
            Map.entry("ARROW_UP", "ArrowUp"),
            Map.entry("UP", "ArrowUp"),
            Map.entry("ARROW_DOWN", "ArrowDown"),
            Map.entry("DOWN", "ArrowDown"),
            Map.entry("ARROW_LEFT", "ArrowLeft"),
            Map.entry("LEFT", "ArrowLeft"),
            Map.entry("ARROW_RIGHT", "ArrowRight"),
            Map.entry("RIGHT", "ArrowRight"),
            Map.entry("HOME", "Home"),
            Map.entry("END", "End"),
            Map.entry("PAGE_UP", "PageUp"),
            Map.entry("PAGE_DOWN", "PageDown")
    );

    private KeyNames() {
    }

    public static String seleniumName(String key) {
        return normalize(key, SELENIUM_KEYS);
    }

    public static String playwrightName(String key) {
        return normalize(key, PLAYWRIGHT_KEYS);
    }

    private static String normalize(String key, Map<String, String> mapping) {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Key must not be blank");
        }
        String normalized = key.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
        return mapping.getOrDefault(normalized, normalized);
    }
}
