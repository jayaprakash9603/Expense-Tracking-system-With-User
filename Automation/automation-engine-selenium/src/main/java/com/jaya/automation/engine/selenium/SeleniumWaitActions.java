package com.jaya.automation.engine.selenium;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.WaitActions;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

final class SeleniumWaitActions implements WaitActions {
    private final WebDriverWait wait;
    private final SeleniumLocatorResolver locatorResolver;

    SeleniumWaitActions(WebDriver webDriver, Duration timeout, SeleniumLocatorResolver locatorResolver) {
        this.wait = new WebDriverWait(webDriver, timeout);
        this.locatorResolver = locatorResolver;
    }

    @Override
    public void forVisible(Locator locator) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(locatorResolver.toBy(locator)));
    }

    @Override
    public void forClickable(Locator locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locatorResolver.toBy(locator)));
    }

    @Override
    public void forUrlContains(String expectedSegment) {
        wait.until(ExpectedConditions.urlContains(expectedSegment));
    }
}
