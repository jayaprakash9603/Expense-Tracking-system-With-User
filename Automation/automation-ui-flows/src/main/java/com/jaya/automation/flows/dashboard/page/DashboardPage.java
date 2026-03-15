package com.jaya.automation.flows.dashboard.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class DashboardPage extends BaseDomainPage {
    public DashboardPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("dashboard", "dashboard-title", "Dashboard"));
    }

    @Override
    public String path() {
        return "/dashboard";
    }
}
