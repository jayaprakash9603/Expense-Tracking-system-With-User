package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.ui.FrameScope;
import com.jaya.automation.core.ui.ScreenshotService;
import com.jaya.automation.core.ui.UiElementActions;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.core.ui.UiEngineException;
import com.jaya.automation.core.ui.WaitActions;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import com.microsoft.playwright.Tracing;

public final class PlaywrightUiEngine implements UiEngine {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(PlaywrightUiEngine.class);
    private final AutomationConfig config;
    private PlaywrightRuntime runtime;
    private PlaywrightScope scope;
    private PlaywrightLocatorResolver locatorResolver;
    private UiElementActions elementActions;
    private WaitActions waitActions;
    private FrameScope frameScope;
    private ScreenshotService screenshotService;

    public PlaywrightUiEngine(AutomationConfig config) {
        this.config = config;
    }

    @Override
    public void start() {
        if (runtime != null) {
            return;
        }
        this.runtime = new PlaywrightBrowserFactory().create(config);
        this.scope = new PlaywrightScope(runtime.page());
        this.locatorResolver = new PlaywrightLocatorResolver();
        PlaywrightWaitActions playwrightWaitActions = new PlaywrightWaitActions(
                runtime.page(),
                scope,
                config.explicitWait(),
                locatorResolver
        );
        this.waitActions = playwrightWaitActions;
        this.elementActions = new PlaywrightElementActions(
                scope,
                locatorResolver,
                playwrightWaitActions,
                config.explicitWait().toMillis()
        );
        this.frameScope = new PlaywrightFrameScope(scope, locatorResolver);
        this.screenshotService = new PlaywrightScreenshotService(runtime.page());
    }

    @Override
    public void navigateTo(String absoluteUrl) {
        ensureStarted();
        runtime.page().navigate(absoluteUrl);
    }

    @Override
    public String currentUrl() {
        ensureStarted();
        return runtime.page().url();
    }

    @Override
    public String pageTitle() {
        ensureStarted();
        return runtime.page().title();
    }

    @Override
    public void reload() {
        ensureStarted();
        runtime.page().reload();
    }

    @Override
    public void navigateBack() {
        ensureStarted();
        runtime.page().goBack();
    }

    @Override
    public void navigateForward() {
        ensureStarted();
        runtime.page().goForward();
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
        if (runtime == null) {
            return false;
        }
        try {
            runtime.page().url();
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    @Override
    public void restart() {
        try {
            if (runtime != null) {
                stopTraceIfEnabled();
                runtime.context().close();
                runtime.browser().close();
                runtime.playwright().close();
            }
        } catch (Exception exception) {
            LOG.debug("Playwright restart cleanup failed, continuing with fresh start: {}", exception.getMessage());
        }
        runtime = null;
        start();
    }

    @Override
    public void stop() {
        if (runtime == null) {
            return;
        }
        stopTraceIfEnabled();
        runtime.context().close();
        runtime.browser().close();
        runtime.playwright().close();
        runtime = null;
    }

    private void ensureStarted() {
        if (runtime == null) {
            throw new UiEngineException("Playwright engine is not started");
        }
    }

    private void stopTraceIfEnabled() {
        if (!runtime.traceEnabled() || runtime.traceOutputPath() == null) {
            return;
        }
        runtime.context().tracing().stop(new Tracing.StopOptions().setPath(runtime.traceOutputPath()));
    }
}
