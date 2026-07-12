package com.jaya.automation.core.ui;

public record Locator(LocatorType type, String value) {
    public static Locator css(String value) {
        return new Locator(LocatorType.CSS, value);
    }

    public static Locator xpath(String value) {
        return new Locator(LocatorType.XPATH, value);
    }

    public static Locator id(String value) {
        return new Locator(LocatorType.ID, value);
    }

    public static Locator name(String value) {
        return new Locator(LocatorType.NAME, value);
    }

    public static Locator text(String value) {
        return new Locator(LocatorType.TEXT, value);
    }
}
