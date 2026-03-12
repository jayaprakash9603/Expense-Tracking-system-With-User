package com.jaya.automation.flows.common.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.core.ui.UiPage;
import com.jaya.automation.flows.common.locator.LocatorSet;

public abstract class BaseDomainPage implements UiPage {
    private final UiEngine uiEngine;
    private final LocatorSet anchor;

    protected BaseDomainPage(UiEngine uiEngine, LocatorSet anchor) {
        this.uiEngine = uiEngine;
        this.anchor = anchor;
    }

    protected UiEngine uiEngine() {
        return uiEngine;
    }

    public void open(String baseUrl) {
        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        uiEngine.navigateTo(normalizedBase + path());
    }

    public boolean isLoaded() {
        return uiEngine.elements().isVisible(anchor.resolve(uiEngine));
    }
}
