package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.WaitActions;
import com.microsoft.playwright.Locator.WaitForOptions;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.WaitForSelectorState;

import java.time.Duration;

final class PlaywrightWaitActions implements WaitActions {
    private final Page page;
    private final PlaywrightLocatorResolver locatorResolver;
    private final double timeoutMs;

    PlaywrightWaitActions(Page page, Duration timeout, PlaywrightLocatorResolver locatorResolver) {
        this.page = page;
        this.locatorResolver = locatorResolver;
        this.timeoutMs = timeout.toMillis();
    }

    @Override
    public void forVisible(Locator locator) {
        WaitForOptions options = new WaitForOptions().setState(WaitForSelectorState.VISIBLE).setTimeout(timeoutMs);
        page.locator(locatorResolver.resolve(locator)).first().waitFor(options);
    }

    @Override
    public void forClickable(Locator locator) {
        forVisible(locator);
    }

    @Override
    public void forUrlContains(String expectedSegment) {
        page.waitForURL("**" + expectedSegment + "**", new Page.WaitForURLOptions().setTimeout(timeoutMs));
    }
}
