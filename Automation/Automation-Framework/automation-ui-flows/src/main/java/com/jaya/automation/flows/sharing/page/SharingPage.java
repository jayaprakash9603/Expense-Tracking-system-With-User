package com.jaya.automation.flows.sharing.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class SharingPage extends BaseDomainPage {
    public SharingPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("sharing", "sharing-title", "Sharing"));
    }

    @Override
    public String path() {
        return "/sharing";
    }
}
