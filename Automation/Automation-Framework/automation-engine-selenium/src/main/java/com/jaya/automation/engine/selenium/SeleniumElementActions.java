package com.jaya.automation.engine.selenium;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiElementActions;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

final class SeleniumElementActions implements UiElementActions {
    private final WebDriver webDriver;
    private final SeleniumLocatorResolver locatorResolver;
    private final SeleniumWaitActions waitActions;

    SeleniumElementActions(WebDriver webDriver, SeleniumLocatorResolver locatorResolver, SeleniumWaitActions waitActions) {
        this.webDriver = webDriver;
        this.locatorResolver = locatorResolver;
        this.waitActions = waitActions;
    }

    @Override
    public void click(Locator locator) {
        waitActions.forClickable(locator);
        locate(locator).click();
    }

    @Override
    public void clearAndType(Locator locator, String value) {
        waitActions.forVisible(locator);
        WebElement element = locate(locator);
        element.clear();
        element.sendKeys(value);
    }

    @Override
    public String textOf(Locator locator) {
        waitActions.forVisible(locator);
        return locate(locator).getText();
    }

    @Override
    public boolean exists(Locator locator) {
        return !webDriver.findElements(locatorResolver.toBy(locator)).isEmpty();
    }

    @Override
    public boolean isVisible(Locator locator) {
        try {
            return locate(locator).isDisplayed();
        } catch (NoSuchElementException ex) {
            return false;
        }
    }

    private WebElement locate(Locator locator) {
        return webDriver.findElement(locatorResolver.toBy(locator));
    }
}
