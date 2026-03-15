package com.jaya.automation.engine.playwright;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;

import java.nio.file.Path;

record PlaywrightRuntime(
        Playwright playwright,
        Browser browser,
        BrowserContext context,
        Page page,
        boolean traceEnabled,
        Path traceOutputPath
) {
}
