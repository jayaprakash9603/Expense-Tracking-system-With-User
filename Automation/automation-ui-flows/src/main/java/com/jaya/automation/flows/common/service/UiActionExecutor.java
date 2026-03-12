package com.jaya.automation.flows.common.service;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.page.BaseDomainPage;

import java.util.Map;

public final class UiActionExecutor {
    private final UiEngine uiEngine;
    private final DomainNavigationFlowService domainNavigationFlowService;
    private final UiActionRegistry uiActionRegistry;

    public UiActionExecutor(UiEngine uiEngine, DomainNavigationFlowService domainNavigationFlowService) {
        this.uiEngine = uiEngine;
        this.domainNavigationFlowService = domainNavigationFlowService;
        this.uiActionRegistry = new UiActionRegistry();
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
