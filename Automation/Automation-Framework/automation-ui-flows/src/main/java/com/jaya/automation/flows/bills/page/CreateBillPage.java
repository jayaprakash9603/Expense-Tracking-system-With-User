package com.jaya.automation.flows.bills.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class CreateBillPage extends BaseDomainPage {
    public CreateBillPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("create-bill", "create-bill-title", "Create Bill"));
    }

    @Override
    public String path() {
        return "/bill/create";
    }
}
