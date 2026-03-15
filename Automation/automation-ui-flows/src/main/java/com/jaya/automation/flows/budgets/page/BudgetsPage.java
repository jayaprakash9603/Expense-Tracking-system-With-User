package com.jaya.automation.flows.budgets.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class BudgetsPage extends BaseDomainPage {
    public BudgetsPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("budgets", "budgets-title", "Budgets"));
    }

    @Override
    public String path() {
        return "/budgets";
    }
}
