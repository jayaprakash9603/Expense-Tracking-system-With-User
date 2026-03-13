package com.jaya.automation.flows.expenses.page;

import com.jaya.automation.core.ui.Locator;
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

    public void clickExpenseRowByName(String expenseName) {
        Locator row = expenseRow(expenseName);
        uiEngine().waits().forClickable(row);
        uiEngine().elements().click(row);
    }

    public boolean isExpenseRowVisible(String expenseName) {
        return uiEngine().elements().isVisible(expenseRow(expenseName));
    }

    private Locator expenseRow(String expenseName) {
        String sanitizedName = expenseName.replace("'", "\\'");
        return Locator.xpath("//*[contains(normalize-space(),'" + sanitizedName + "')]");
    }
}
