package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.util.ArtifactPaths;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.Tracing;

import java.nio.file.Path;

final class PlaywrightBrowserFactory {
    PlaywrightRuntime create(AutomationConfig config) {
        Playwright playwright = Playwright.create();
        Browser browser = createBrowser(playwright, config);
        BrowserContext context = createContext(browser, config);
        Path traceOutputPath = startTraceIfEnabled(context, config);
        Page page = context.newPage();
        return new PlaywrightRuntime(
                playwright,
                browser,
                context,
                page,
                config.observabilitySettings().traceEnabled(),
                traceOutputPath
        );
    }

    private Browser createBrowser(Playwright playwright, AutomationConfig config) {
        return switch (config.browserType()) {
            case CHROME -> playwright.chromium().launch(chromiumOptions(config.headless()));
            case EDGE -> playwright.chromium().launch(edgeOptions(config.headless()));
            case FIREFOX -> playwright.firefox().launch(firefoxOptions(config.headless()));
        };
    }

    private BrowserContext createContext(Browser browser, AutomationConfig config) {
        Browser.NewContextOptions options = new Browser.NewContextOptions();
        options.setViewportSize(1920, 1080);
        if (config.observabilitySettings().videoEnabled()) {
            options.setRecordVideoDir(ArtifactPaths.videoDirectory("playwright"));
            options.setRecordVideoSize(1920, 1080);
        }
        return browser.newContext(options);
    }

    private Path startTraceIfEnabled(BrowserContext context, AutomationConfig config) {
        if (!config.observabilitySettings().traceEnabled()) {
            return null;
        }
        context.tracing().start(new Tracing.StartOptions().setScreenshots(true).setSnapshots(true).setSources(true));
        return ArtifactPaths.tracePath("playwright", "session");
    }

    private BrowserType.LaunchOptions chromiumOptions(boolean headless) {
        BrowserType.LaunchOptions options = new BrowserType.LaunchOptions();
        options.setHeadless(headless);
        return options;
    }

    private BrowserType.LaunchOptions edgeOptions(boolean headless) {
        BrowserType.LaunchOptions options = new BrowserType.LaunchOptions();
        options.setHeadless(headless);
        options.setChannel("msedge");
        return options;
    }

    private BrowserType.LaunchOptions firefoxOptions(boolean headless) {
        BrowserType.LaunchOptions options = new BrowserType.LaunchOptions();
        options.setHeadless(headless);
        return options;
    }
}
