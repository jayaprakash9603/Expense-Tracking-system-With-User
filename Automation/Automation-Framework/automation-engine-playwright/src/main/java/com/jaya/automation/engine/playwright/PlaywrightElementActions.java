package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiElementActions;
import com.microsoft.playwright.Locator.ClickOptions;
import com.microsoft.playwright.Locator.FillOptions;
import com.microsoft.playwright.Page;

final class PlaywrightElementActions implements UiElementActions {
    private final Page page;
    private final PlaywrightLocatorResolver locatorResolver;
    private final PlaywrightWaitActions waitActions;
    private final double timeoutMs;

    PlaywrightElementActions(Page page, PlaywrightLocatorResolver locatorResolver, PlaywrightWaitActions waitActions, double timeoutMs) {
        this.page = page;
        this.locatorResolver = locatorResolver;
        this.waitActions = waitActions;
        this.timeoutMs = timeoutMs;
    }

    @Override
    public void click(Locator locator) {
        waitActions.forClickable(locator);
        page.locator(locatorResolver.resolve(locator)).first().click(new ClickOptions().setTimeout(timeoutMs));
    }

    @Override
    public void clearAndType(Locator locator, String value) {
        waitActions.forVisible(locator);
        page.locator(locatorResolver.resolve(locator)).first().fill(value, new FillOptions().setTimeout(timeoutMs));
    }

    @Override
    public String textOf(Locator locator) {
        waitActions.forVisible(locator);
        String text = page.locator(locatorResolver.resolve(locator)).first().textContent();
        return text == null ? "" : text.trim();
    }

    @Override
    public boolean exists(Locator locator) {
        return page.locator(locatorResolver.resolve(locator)).count() > 0;
    }

    @Override
    public boolean isVisible(Locator locator) {
        return page.locator(locatorResolver.resolve(locator)).first().isVisible();
    }
}
