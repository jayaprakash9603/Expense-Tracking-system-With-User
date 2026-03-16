package com.jaya.automation.flows.common.service;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorSet;
import com.jaya.automation.flows.common.page.BaseDomainPage;

import java.util.Map;

public final class UiActionExecutor {
    private final UiEngine uiEngine;
    private final DomainNavigationFlowService domainNavigationFlowService;
    private final UiActionRegistry uiActionRegistry;
    private final TabRouteRegistry tabRouteRegistry;

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
        clickTab(tabLabel, tabPath);
        uiEngine.waits().forUrlContains(tabPath);
        return tabPath;
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
        Locator locator = uiActionRegistry.action(actionKey).resolve(uiEngine);
        uiEngine.waits().forClickable(locator);
        uiEngine.elements().click(locator);
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
}
