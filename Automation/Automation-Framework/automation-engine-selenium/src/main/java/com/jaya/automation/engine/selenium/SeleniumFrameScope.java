package com.jaya.automation.engine.selenium;

import com.jaya.automation.core.ui.FrameScope;
import com.jaya.automation.core.ui.Locator;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

final class SeleniumFrameScope implements FrameScope {
    private final WebDriver webDriver;
    private final SeleniumLocatorResolver locatorResolver;

    SeleniumFrameScope(WebDriver webDriver, SeleniumLocatorResolver locatorResolver) {
        this.webDriver = webDriver;
        this.locatorResolver = locatorResolver;
    }

    @Override
    public void enter(Locator frameLocator) {
        WebElement frameElement = webDriver.findElement(locatorResolver.toBy(frameLocator));
        webDriver.switchTo().frame(frameElement);
    }

    @Override
    public void exitToRoot() {
        webDriver.switchTo().defaultContent();
    }
}
