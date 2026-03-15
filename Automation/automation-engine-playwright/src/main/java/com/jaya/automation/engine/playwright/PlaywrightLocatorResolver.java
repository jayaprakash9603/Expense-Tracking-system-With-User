package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.ui.Locator;

final class PlaywrightLocatorResolver {
    String resolve(Locator locator) {
        return switch (locator.type()) {
            case CSS -> locator.value();
            case XPATH -> "xpath=" + locator.value();
            case ID -> "#" + locator.value();
            case NAME -> "[name='" + escape(locator.value()) + "']";
            case TEXT -> "text=" + locator.value();
        };
    }

    private String escape(String value) {
        return value.replace("'", "\\'");
    }
}
