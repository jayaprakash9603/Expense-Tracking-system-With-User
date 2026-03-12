package com.jaya.automation.flows.expenses.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class ExpensesPage extends BaseDomainPage {
    public ExpensesPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("expenses", "expenses-title", "Expenses"));
    }

    @Override
    public String path() {
        return "/expenses";
    }
}
