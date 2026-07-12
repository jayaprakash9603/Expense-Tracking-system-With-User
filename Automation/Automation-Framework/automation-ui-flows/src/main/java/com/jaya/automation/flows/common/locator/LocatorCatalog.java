package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class LocatorCatalog {
    private LocatorCatalog() {
    }

    public static LocatorSet input(String name, String testId, String fallbackSelector, String placeholder) {
        return LocatorSet.of(
                name,
                Locator.css("[data-testid='" + testId + "']"),
                Locator.css(fallbackSelector),
                Locator.css("input[placeholder='" + placeholder + "']")
        );
    }

    public static LocatorSet button(String name, String testId, String text) {
        return LocatorSet.of(
                name,
                Locator.css("[data-testid='" + testId + "']"),
                Locator.xpath("//button[normalize-space()='" + text + "']"),
                Locator.text(text)
        );
    }
}
