package com.jaya.automation.engine.selenium;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.ui.FrameScope;
import com.jaya.automation.core.ui.ScreenshotService;
import com.jaya.automation.core.ui.UiElementActions;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.core.ui.UiEngineException;
import com.jaya.automation.core.ui.WaitActions;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

public final class SeleniumUiEngine implements UiEngine {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(SeleniumUiEngine.class);
    private final AutomationConfig config;
    private WebDriver webDriver;
    private SeleniumLocatorResolver locatorResolver;
    private UiElementActions elementActions;
    private WaitActions waitActions;
    private FrameScope frameScope;
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
        this.locatorResolver = new SeleniumLocatorResolver();
        SeleniumWaitActions seleniumWaitActions = new SeleniumWaitActions(webDriver, config.explicitWait(), locatorResolver);
        this.waitActions = seleniumWaitActions;
        this.elementActions = new SeleniumElementActions(webDriver, locatorResolver, seleniumWaitActions);
        this.frameScope = new SeleniumFrameScope(webDriver, locatorResolver);
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
    public String pageTitle() {
        ensureStarted();
        return webDriver.getTitle();
    }

    @Override
    public void reload() {
        ensureStarted();
        webDriver.navigate().refresh();
    }

    @Override
    public void navigateBack() {
        ensureStarted();
        webDriver.navigate().back();
    }

    @Override
    public void navigateForward() {
        ensureStarted();
        webDriver.navigate().forward();
    }

    @Override
    public FrameScope frames() {
        ensureStarted();
        return frameScope;
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
    public boolean isAlive() {
        if (webDriver == null) {
            return false;
        }
        try {
            webDriver.getTitle();
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    @Override
    public void restart() {
        try {
            if (webDriver != null) {
                webDriver.quit();
            }
        } catch (Exception exception) {
            LOG.debug("Selenium restart cleanup failed, continuing with fresh start: {}", exception.getMessage());
        }
        webDriver = null;
        start();
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
