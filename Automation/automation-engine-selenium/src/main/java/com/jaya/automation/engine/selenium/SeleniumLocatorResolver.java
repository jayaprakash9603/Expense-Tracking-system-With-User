package com.jaya.automation.engine.selenium;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.LocatorType;
import org.openqa.selenium.By;

final class SeleniumLocatorResolver {
    By toBy(Locator locator) {
        return switch (locator.type()) {
            case CSS -> By.cssSelector(locator.value());
            case XPATH -> By.xpath(locator.value());
            case ID -> By.id(locator.value());
            case NAME -> By.name(locator.value());
            case TEXT -> By.xpath(buildTextXpath(locator.value()));
        };
    }

    private String buildTextXpath(String text) {
        String escaped = text.replace("'", "\\'");
        return "//*[contains(normalize-space(),'" + escaped + "')]";
    }
}
