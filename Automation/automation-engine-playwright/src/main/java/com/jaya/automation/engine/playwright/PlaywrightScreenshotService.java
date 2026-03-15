package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.ui.ScreenshotService;
import com.jaya.automation.core.util.ArtifactPaths;
import com.microsoft.playwright.Page;

import java.nio.file.Path;

final class PlaywrightScreenshotService implements ScreenshotService {
    private final Page page;

    PlaywrightScreenshotService(Page page) {
        this.page = page;
    }

    @Override
    public Path capture(String scenarioName) {
        Path outputPath = ArtifactPaths.screenshotPath("playwright", scenarioName);
        page.screenshot(new Page.ScreenshotOptions().setPath(outputPath));
        return outputPath;
    }
}
