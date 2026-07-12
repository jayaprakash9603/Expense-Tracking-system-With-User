package com.jaya.automation.flows.admin.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class AdminPage extends BaseDomainPage {
    public AdminPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("admin", "admin-title", "Admin"));
    }

    @Override
    public String path() {
        return "/admin";
    }
}
