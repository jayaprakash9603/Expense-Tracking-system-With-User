package com.jaya.automation.engine.selenium;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.ui.ScreenshotService;
import com.jaya.automation.core.ui.UiElementActions;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.core.ui.UiEngineException;
import com.jaya.automation.core.ui.WaitActions;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

public final class SeleniumUiEngine implements UiEngine {
    private final AutomationConfig config;
    private WebDriver webDriver;
    private UiElementActions elementActions;
    private WaitActions waitActions;
    private ScreenshotService screenshotService;

    public SeleniumUiEngine(AutomationConfig config) {
        this.config = config;
    }

    @Override
    public void start() {
        if (webDriver != null) {
            return;
        }
        this.webDriver = SeleniumDriverFactory.create(config);
        SeleniumLocatorResolver resolver = new SeleniumLocatorResolver();
        SeleniumWaitActions seleniumWaitActions = new SeleniumWaitActions(webDriver, config.explicitWait(), resolver);
        this.waitActions = seleniumWaitActions;
        this.elementActions = new SeleniumElementActions(webDriver, resolver, seleniumWaitActions);
        this.screenshotService = new SeleniumScreenshotService((TakesScreenshot) webDriver);
    }

    @Override
    public void navigateTo(String absoluteUrl) {
        ensureStarted();
        webDriver.get(absoluteUrl);
    }

    @Override
    public String currentUrl() {
        ensureStarted();
        return webDriver.getCurrentUrl();
    }

    @Override
    public UiElementActions elements() {
        ensureStarted();
        return elementActions;
    }

    @Override
    public WaitActions waits() {
        ensureStarted();
        return waitActions;
    }

    @Override
    public ScreenshotService screenshots() {
        ensureStarted();
        return screenshotService;
    }

    @Override
    public void stop() {
        if (webDriver == null) {
            return;
        }
        webDriver.quit();
        webDriver = null;
    }

    private void ensureStarted() {
        if (webDriver == null) {
            throw new UiEngineException("Selenium engine is not started");
        }
    }
}
