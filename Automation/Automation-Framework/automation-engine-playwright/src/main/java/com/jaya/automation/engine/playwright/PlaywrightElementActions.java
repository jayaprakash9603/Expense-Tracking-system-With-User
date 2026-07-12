package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiElementActions;
import com.microsoft.playwright.Locator.ClickOptions;
import com.microsoft.playwright.Locator.FillOptions;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.PlaywrightException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

final class PlaywrightElementActions implements UiElementActions {
    private static final Logger LOG = LoggerFactory.getLogger(PlaywrightElementActions.class);

    private final Page page;
    private final PlaywrightLocatorResolver locatorResolver;
    private final PlaywrightWaitActions waitActions;
    private final double timeoutMs;

    PlaywrightElementActions(Page page, PlaywrightLocatorResolver locatorResolver,
                             PlaywrightWaitActions waitActions, double timeoutMs) {
        this.page = page;
        this.locatorResolver = locatorResolver;
        this.waitActions = waitActions;
        this.timeoutMs = timeoutMs;
    }

    @Override
    public void click(Locator locator) {
        waitActions.forClickable(locator);
        resolve(locator).click(new ClickOptions().setTimeout(timeoutMs));
    }

    @Override
    public void clearAndType(Locator locator, String value) {
        waitActions.forVisible(locator);
        resolve(locator).fill(value, new FillOptions().setTimeout(timeoutMs));
    }

    @Override
    public String textOf(Locator locator) {
        waitActions.forVisible(locator);
        String text = resolve(locator).textContent();
        return text == null ? "" : text.trim();
    }

    @Override
    public boolean exists(Locator locator) {
        return page.locator(locatorResolver.resolve(locator)).count() > 0;
    }

    @Override
    public boolean isVisible(Locator locator) {
        try {
            com.microsoft.playwright.Locator pwLocator = page.locator(locatorResolver.resolve(locator));
            return pwLocator.count() > 0 && pwLocator.first().isVisible();
        } catch (PlaywrightException ex) {
            LOG.debug("isVisible check failed for locator {}: {}", locator.value(), ex.getMessage());
            return false;
        }
    }

    private com.microsoft.playwright.Locator resolve(Locator locator) {
        return page.locator(locatorResolver.resolve(locator)).first();
    }
}
