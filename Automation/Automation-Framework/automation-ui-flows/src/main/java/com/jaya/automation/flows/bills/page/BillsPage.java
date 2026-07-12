package com.jaya.automation.flows.bills.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class BillsPage extends BaseDomainPage {
    public BillsPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("bills", "bills-title", "Bills"));
    }

    @Override
    public String path() {
        return "/bill";
    }
}
