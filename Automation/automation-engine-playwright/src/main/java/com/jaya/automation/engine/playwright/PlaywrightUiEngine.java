package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.ui.ScreenshotService;
import com.jaya.automation.core.ui.UiElementActions;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.core.ui.UiEngineException;
import com.jaya.automation.core.ui.WaitActions;
import com.microsoft.playwright.Tracing;

public final class PlaywrightUiEngine implements UiEngine {
    private final AutomationConfig config;
    private PlaywrightRuntime runtime;
    private UiElementActions elementActions;
    private WaitActions waitActions;
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
        PlaywrightLocatorResolver resolver = new PlaywrightLocatorResolver();
        PlaywrightWaitActions playwrightWaitActions = new PlaywrightWaitActions(
                runtime.page(),
                config.explicitWait(),
                resolver
        );
        this.waitActions = playwrightWaitActions;
        this.elementActions = new PlaywrightElementActions(
                runtime.page(),
                resolver,
                playwrightWaitActions,
                config.explicitWait().toMillis()
        );
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
