package com.jaya.automation.flows.common.locator;

import java.util.Locale;

public final class LocatorRegistrySupport {

    private LocatorRegistrySupport() {
    }

    public static LocatorSet firstNonNull(LocatorSet... candidates) {
        for (LocatorSet candidate : candidates) {
            if (candidate != null) {
                return candidate;
            }
        }
        return null;
    }

    public static String normalize(String key) {
        return key.trim()
                .toLowerCase(Locale.ROOT)
                .replace(" ", "-")
                .replace(".", "-")
                .replace("_", "-");
    }

    public static String titleCase(String value) {
        if (value.isBlank()) {
            return value;
        }
        String[] tokens = value.replace("-", " ").split("\\s+");
        StringBuilder title = new StringBuilder();
        for (String token : tokens) {
            if (token.isBlank()) {
                continue;
            }
            if (title.length() > 0) {
                title.append(' ');
            }
            title.append(Character.toUpperCase(token.charAt(0)));
            if (token.length() > 1) {
                title.append(token.substring(1));
            }
        }
        return title.toString();
    }
}
