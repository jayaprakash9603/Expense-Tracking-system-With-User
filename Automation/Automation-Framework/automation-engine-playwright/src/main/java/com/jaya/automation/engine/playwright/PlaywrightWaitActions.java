package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.WaitActions;
import com.microsoft.playwright.Locator.WaitForOptions;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.PlaywrightException;
import com.microsoft.playwright.options.LoadState;
import com.microsoft.playwright.options.WaitForSelectorState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;

final class PlaywrightWaitActions implements WaitActions {
    private static final Logger LOG = LoggerFactory.getLogger(PlaywrightWaitActions.class);
    private static final long ENABLED_POLL_INTERVAL_MS = 200;

    private final Page page;
    private final PlaywrightScope scope;
    private final PlaywrightLocatorResolver locatorResolver;
    private final double timeoutMs;

    PlaywrightWaitActions(Page page, PlaywrightScope scope, Duration timeout, PlaywrightLocatorResolver locatorResolver) {
        this.page = page;
        this.scope = scope;
        this.locatorResolver = locatorResolver;
        this.timeoutMs = timeout.toMillis();
    }

    @Override
    public void forVisible(Locator locator) {
        WaitForOptions options = new WaitForOptions()
                .setState(WaitForSelectorState.VISIBLE)
                .setTimeout(timeoutMs);
        scope.locator(locatorResolver.resolve(locator)).waitFor(options);
    }

    @Override
    public boolean forVisible(Locator locator, long customTimeoutMs) {
        try {
            WaitForOptions options = new WaitForOptions()
                    .setState(WaitForSelectorState.VISIBLE)
                    .setTimeout(customTimeoutMs);
            scope.locator(locatorResolver.resolve(locator)).waitFor(options);
            return true;
        } catch (PlaywrightException ex) {
            LOG.debug("Timed visibility wait failed for locator {}: {}", locator.value(), ex.getMessage());
            return false;
        }
    }

    @Override
    public void forClickable(Locator locator) {
        forVisible(locator);
    }

    @Override
    public void forUrlContains(String expectedSegment) {
        page.waitForURL("**" + expectedSegment + "**", new Page.WaitForURLOptions().setTimeout(timeoutMs));
    }

    @Override
    public void forDocumentReady() {
        page.waitForLoadState(LoadState.LOAD);
        try {
            page.waitForLoadState(LoadState.NETWORKIDLE, new Page.WaitForLoadStateOptions().setTimeout(timeoutMs));
        } catch (PlaywrightException ex) {
            LOG.debug("Network idle wait timed out (non-blocking): {}", ex.getMessage());
        }
    }

    @Override
    public boolean isVisibleSafe(Locator locator) {
        try {
            com.microsoft.playwright.Locator pwLocator = scope.locator(locatorResolver.resolve(locator));
            return pwLocator.count() > 0 && pwLocator.isVisible();
        } catch (PlaywrightException ex) {
            LOG.debug("isVisibleSafe returned false for locator: {}", locator.value());
            return false;
        }
    }

    @Override
    public boolean waitForPageReady(Locator locator, long customTimeoutMs) {
        double effectiveTimeout = customTimeoutMs > 0 ? customTimeoutMs : timeoutMs;
        try {
            scope.locator(locatorResolver.resolve(locator)).waitFor(
                    new WaitForOptions()
                            .setState(WaitForSelectorState.VISIBLE)
                            .setTimeout(effectiveTimeout)
            );
            LOG.debug("Page ready: element visible for locator {}", locator.value());
            return true;
        } catch (PlaywrightException ex) {
            LOG.warn("Page not ready within {}ms for locator {}: {}", effectiveTimeout, locator.value(), ex.getMessage());
            return false;
        }
    }

    @Override
    public boolean waitForEnabled(Locator locator, long customTimeoutMs) {
        double effectiveTimeout = customTimeoutMs > 0 ? customTimeoutMs : timeoutMs;
        try {
            com.microsoft.playwright.Locator element = scope.locator(locatorResolver.resolve(locator));
            element.waitFor(
                    new WaitForOptions()
                            .setState(WaitForSelectorState.VISIBLE)
                            .setTimeout(effectiveTimeout)
            );
            long startTime = System.currentTimeMillis();
            while (System.currentTimeMillis() - startTime < effectiveTimeout) {
                if (element.isEnabled()) {
                    LOG.debug("Element visible and enabled for locator {}", locator.value());
                    return true;
                }
                sleepQuietly(ENABLED_POLL_INTERVAL_MS);
            }
            LOG.warn("Element visible but not enabled within {}ms for locator {}", effectiveTimeout, locator.value());
            return false;
        } catch (PlaywrightException ex) {
            LOG.warn("waitForEnabled failed for locator {}: {}", locator.value(), ex.getMessage());
            return false;
        }
    }

    @Override
    public void forNetworkIdle() {
        try {
            page.waitForLoadState(LoadState.NETWORKIDLE);
        } catch (PlaywrightException ex) {
            LOG.debug("Network idle wait timed out (non-blocking): {}", ex.getMessage());
        }
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
