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

    public void clickExpenseCardByName(String expenseName) {
        Locator card = expenseCard(expenseName);
        uiEngine().waits().forClickable(card);
        uiEngine().elements().click(card);
    }

    public boolean isExpenseCardVisible(String expenseName) {
        return uiEngine().elements().isVisible(expenseCard(expenseName));
    }

    public void clickEditForExpense(String expenseName) {
        clickExpenseCardByName(expenseName);
        Locator editAction = expenseEditAction(expenseName);
        uiEngine().waits().forClickable(editAction);
        uiEngine().elements().click(editAction);
    }

    public void clickDeleteForExpense(String expenseName) {
        clickExpenseCardByName(expenseName);
        Locator deleteAction = expenseDeleteAction(expenseName);
        uiEngine().waits().forClickable(deleteAction);
        uiEngine().elements().click(deleteAction);
    }

    private Locator expenseCard(String expenseName) {
        String nameKey = toNameKey(expenseName);
        return Locator.css("[data-testid='expense-card'][data-expense-name-key='" + nameKey + "']");
    }

    private Locator expenseEditAction(String expenseName) {
        String nameKey = toNameKey(expenseName);
        return Locator.css("[data-testid='expense-card-edit'][data-expense-name-key='" + nameKey + "']");
    }

    private Locator expenseDeleteAction(String expenseName) {
        String nameKey = toNameKey(expenseName);
        return Locator.css("[data-testid='expense-card-delete'][data-expense-name-key='" + nameKey + "']");
    }

    private String toNameKey(String expenseName) {
        return expenseName
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9-_]", "");
    }
}
