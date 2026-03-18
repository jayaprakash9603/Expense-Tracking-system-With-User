package com.jaya.automation.flows.common.service;

import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.core.util.RetryExecutor;
import com.jaya.automation.flows.common.locator.LocatorSet;
import com.jaya.automation.flows.common.page.BaseDomainPage;

import java.util.Map;

public final class UiActionExecutor {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(UiActionExecutor.class);
    private static final int DEFAULT_INTERACTION_RETRIES = 3;

    private final UiEngine uiEngine;
    private final DomainNavigationFlowService domainNavigationFlowService;
    private final UiActionRegistry uiActionRegistry;
    private final TabRouteRegistry tabRouteRegistry;
    private static final int TAB_NAVIGATION_RETRIES = 3;
    private static final long TAB_CLICK_SETTLE_MS = 1500;

    public UiActionExecutor(UiEngine uiEngine, DomainNavigationFlowService domainNavigationFlowService) {
        this.uiEngine = uiEngine;
        this.domainNavigationFlowService = domainNavigationFlowService;
        this.uiActionRegistry = new UiActionRegistry();
        this.tabRouteRegistry = new TabRouteRegistry();
    }

    public void navigateToDomain(String domainKey, String baseUrl) {
        BaseDomainPage page = uiActionRegistry.domainPage(domainKey, domainNavigationFlowService);
        page.open(baseUrl);
        uiEngine.waits().forUrlContains(page.path());
    }

    public boolean isDomainLoaded(String domainKey) {
        BaseDomainPage page = uiActionRegistry.domainPage(domainKey, domainNavigationFlowService);
        return page.isLoaded();
    }

    

    public String navigateToTab(String tabLabel, String baseUrl) {
        String tabPath = resolveTabPath(tabLabel);
        if (isAuthRoute(tabPath)) {
            openTabByPath(baseUrl, tabPath);
            return tabPath;
        }
        if (urlAlreadyContains(tabPath)) {
            LOG.info("Already on '{}' — skipping navigation", tabPath);
            return tabPath;
        }
        if (navigateViaClickWithRetry(tabLabel, tabPath)) {
            return tabPath;
        }
        LOG.info("Click navigation to '{}' failed after retries — falling back to direct URL", tabPath);
        openTabByPath(baseUrl, tabPath);
        return tabPath;
    }

    private boolean navigateViaClickWithRetry(String tabLabel, String tabPath) {
        for (int attempt = 1; attempt <= TAB_NAVIGATION_RETRIES; attempt++) {
            try {
                clickTab(tabLabel, tabPath);
                sleepQuietly(TAB_CLICK_SETTLE_MS);
                if (urlAlreadyContains(tabPath)) {
                    LOG.info("Tab '{}' navigated via click on attempt {}", tabPath, attempt);
                    return true;
                }
            } catch (Exception ex) {
                LOG.debug("Tab click attempt {}/{} for '{}' failed: {}",
                        attempt, TAB_NAVIGATION_RETRIES, tabPath, ex.getMessage());
            }
        }
        return false;
    }

    private boolean urlAlreadyContains(String segment) {
        try {
            String currentUrl = uiEngine.currentUrl();
            return currentUrl != null && currentUrl.contains(segment);
        } catch (Exception ex) {
            return false;
        }
    }

    public String resolveTabPath(String tabLabel) {
        return tabRouteRegistry.requirePath(tabLabel);
    }

    public String currentUrl() {
        return uiEngine.currentUrl();
    }

    private void clickTab(String tabLabel, String tabPath) {
        Locator tabLocator = tabLocator(tabLabel, tabPath).resolve(uiEngine);
        uiEngine.waits().forClickable(tabLocator);
        uiEngine.elements().click(tabLocator);
    }

    private void openTabByPath(String baseUrl, String tabPath) {
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        uiEngine.navigateTo(normalizedBaseUrl + tabPath);
        uiEngine.waits().forUrlContains(tabPath);
    }

    private LocatorSet tabLocator(String tabLabel, String tabPath) {
        String normalizedTabId = tabPath
                .replaceFirst("^/", "")
                .replace("/", "-");
        return LocatorSet.of(
                "tab-" + tabPath.replace("/", "-"),
                Locator.css("[id='nav-item-" + normalizedTabId + "']"),
                Locator.css("a[href='" + tabPath + "']"),
                Locator.xpath("//a[normalize-space()='" + tabLabel + "']"),
                Locator.xpath("//button[normalize-space()='" + tabLabel + "']"),
                Locator.text(tabLabel)
        );
    }

    private boolean isAuthRoute(String tabPath) {
        return "/login".equals(tabPath) || "/register".equals(tabPath);
    }

    public void fillFields(Map<String, String> fieldValues) {
        for (Map.Entry<String, String> entry : fieldValues.entrySet()) {
            Locator locator = uiActionRegistry.field(entry.getKey()).resolve(uiEngine);
            uiEngine.waits().forVisible(locator);
            uiEngine.elements().clearAndType(locator, entry.getValue());
        }
    }

    public void clickAction(String actionKey) {
        LocatorSet set = uiActionRegistry.action(actionKey);
        if (set.isFirstCandidatePreferred() && !set.candidates().isEmpty()) {
            clickFirstCandidate(set);
            return;
        }
        Locator locator = set.resolve(uiEngine);
        uiEngine.waits().forClickable(locator);
        uiEngine.elements().click(locator);
    }

    private void clickFirstCandidate(LocatorSet set) {
        Locator modalButton = set.candidates().get(0);
        uiEngine.waits().forVisible(modalButton);
        uiEngine.waits().forClickable(modalButton);
        uiEngine.elements().click(modalButton);
    }

    public String textOf(String textKey) {
        Locator locator = uiActionRegistry.text(textKey).resolve(uiEngine);
        uiEngine.waits().forVisible(locator);
        return uiEngine.elements().textOf(locator);
    }

    public boolean isVisible(String textKey) {
        Locator locator = uiActionRegistry.text(textKey).resolve(uiEngine);
        return uiEngine.elements().isVisible(locator);
    }

    public void resilientClick(String actionKey) {
        resilientClick(actionKey, DEFAULT_INTERACTION_RETRIES);
    }

    public void resilientClick(String actionKey, int maxAttempts) {
        RetryExecutor.execute(() -> {
            Locator locator = uiActionRegistry.action(actionKey).resolveWithRetry(uiEngine, maxAttempts);
            uiEngine.waits().forClickable(locator);
            uiEngine.elements().click(locator);
            return null;
        }, maxAttempts);
        LOG.info("Resilient click completed for action: {}", actionKey);
    }

    public void resilientFillFields(Map<String, String> fieldValues) {
        resilientFillFields(fieldValues, DEFAULT_INTERACTION_RETRIES);
    }

    public void resilientFillFields(Map<String, String> fieldValues, int maxAttempts) {
        for (Map.Entry<String, String> entry : fieldValues.entrySet()) {
            RetryExecutor.execute(() -> {
                Locator locator = uiActionRegistry.field(entry.getKey()).resolveWithRetry(uiEngine, maxAttempts);
                uiEngine.waits().forVisible(locator);
                uiEngine.elements().clearAndType(locator, entry.getValue());
                return null;
            }, maxAttempts);
        }
    }

    public String resilientTextOf(String textKey) {
        return resilientTextOf(textKey, DEFAULT_INTERACTION_RETRIES);
    }

    public String resilientTextOf(String textKey, int maxAttempts) {
        return RetryExecutor.execute(() -> {
            Locator locator = uiActionRegistry.text(textKey).resolveWithRetry(uiEngine, maxAttempts);
            uiEngine.waits().forVisible(locator);
            return uiEngine.elements().textOf(locator);
        }, maxAttempts);
    }

    public void selectDropdownOption(String dropdownKey, String optionText) {
        Locator dropdownLocator = uiActionRegistry.field(dropdownKey).resolve(uiEngine);
        uiEngine.waits().forClickable(dropdownLocator);
        uiEngine.elements().click(dropdownLocator);
        Locator optionLocator = Locator.xpath(
                "//li[normalize-space()='" + optionText + "'] | //div[@role='option'][normalize-space()='" + optionText + "']"
        );
        uiEngine.waits().forVisible(optionLocator);
        uiEngine.elements().click(optionLocator);
    }

    public void waitUntilVisible(String elementKey) {
        Locator locator = uiActionRegistry.text(elementKey).resolve(uiEngine);
        uiEngine.waits().forVisible(locator);
    }

    public void fillField(String fieldKey, String value) {
        Locator locator = uiActionRegistry.field(fieldKey).resolve(uiEngine);
        uiEngine.waits().forVisible(locator);
        uiEngine.elements().clearAndType(locator, value);
    }

    public String textOfAction(String actionKey) {
        Locator locator = uiActionRegistry.action(actionKey).resolve(uiEngine);
        uiEngine.waits().forVisible(locator);
        return uiEngine.elements().textOf(locator);
    }

    public void clickRowAction(String actionText, String rowIdentifier) {
        String rowXpath = String.format(
                "//tr[.//*[contains(normalize-space(),'%s')]]//button[normalize-space()='%s']"
                + " | //div[@role='row'][.//*[contains(normalize-space(),'%s')]]//button[normalize-space()='%s']",
                rowIdentifier, actionText, rowIdentifier, actionText
        );
        Locator locator = Locator.xpath(rowXpath);
        uiEngine.waits().forClickable(locator);
        uiEngine.elements().click(locator);
    }

    public boolean elementExists(String elementKey) {
        Locator locator = uiActionRegistry.text(elementKey).resolve(uiEngine);
        return uiEngine.elements().exists(locator);
    }

    public boolean resilientIsVisible(String elementKey) {
        return resilientIsVisible(elementKey, DEFAULT_INTERACTION_RETRIES);
    }

    public boolean resilientIsVisible(String elementKey, int maxAttempts) {
        return RetryExecutor.execute(() -> {
            Locator locator = uiActionRegistry.text(elementKey).resolveWithRetry(uiEngine, maxAttempts);
            return uiEngine.elements().isVisible(locator);
        }, maxAttempts);
    }

    public boolean waitForPageReady(String elementKey, long timeoutMs) {
        Locator locator = uiActionRegistry.text(elementKey).resolve(uiEngine);
        return uiEngine.waits().waitForPageReady(locator, timeoutMs);
    }

    public boolean waitForElementEnabled(String elementKey, long timeoutMs) {
        Locator locator = uiActionRegistry.text(elementKey).resolve(uiEngine);
        return uiEngine.waits().waitForEnabled(locator, timeoutMs);
    }

    public void waitForWithRefresh(String elementKey, int maxRetries, long waitMs) {
        Locator locator = uiActionRegistry.text(elementKey).resolve(uiEngine);
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            if (uiEngine.waits().isVisibleSafe(locator)) {
                LOG.info("Element '{}' visible after {} attempt(s)", elementKey, attempt);
                return;
            }
            LOG.debug("Element '{}' not visible, refreshing (attempt {}/{})", elementKey, attempt, maxRetries);
            uiEngine.navigateTo(uiEngine.currentUrl());
            sleepQuietly(waitMs);
        }
        throw new IllegalStateException(
                "Element '" + elementKey + "' not visible after " + maxRetries + " refreshes"
        );
    }

    public void waitForNetworkIdle() {
        uiEngine.waits().forNetworkIdle();
    }

    public boolean isVisibleSafe(String elementKey) {
        Locator locator = uiActionRegistry.text(elementKey).resolve(uiEngine);
        return uiEngine.waits().isVisibleSafe(locator);
    }

    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}
