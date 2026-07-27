package com.jaya.automation.core.ui;

public final class LocatorParser {

    private LocatorParser() {
    }

    public static Locator parse(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Locator value must not be blank");
        }
        String trimmed = value.trim();
        if (trimmed.startsWith("xpath=")) {
            return Locator.xpath(trimmed.substring(6));
        }
        if (trimmed.startsWith("css=")) {
            return Locator.css(trimmed.substring(4));
        }
        if (trimmed.startsWith("id=")) {
            return Locator.id(trimmed.substring(3));
        }
        if (trimmed.startsWith("name=")) {
            return Locator.name(trimmed.substring(5));
        }
        if (trimmed.startsWith("text=")) {
            return Locator.text(trimmed.substring(5));
        }
        if (trimmed.startsWith("//") || trimmed.startsWith("(//")) {
            return Locator.xpath(trimmed);
        }
        return Locator.css(trimmed);
    }

    public static boolean looksLikeSelector(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        String trimmed = value.trim();
        if (trimmed.startsWith("xpath=") || trimmed.startsWith("css=")
                || trimmed.startsWith("id=") || trimmed.startsWith("name=")
                || trimmed.startsWith("text=")) {
            return true;
        }
        if (trimmed.startsWith("//") || trimmed.startsWith("(//")) {
            return true;
        }
        return trimmed.startsWith("#")
                || trimmed.startsWith(".")
                || trimmed.startsWith("[")
                || trimmed.contains(" > ")
                || trimmed.contains("::");
    }
}
