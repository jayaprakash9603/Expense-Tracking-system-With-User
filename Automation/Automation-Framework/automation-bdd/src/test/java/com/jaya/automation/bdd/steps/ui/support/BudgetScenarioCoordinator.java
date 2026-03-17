package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.bdd.context.BddWorld;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;

public final class BudgetScenarioCoordinator {
    private static final String ORIGINAL_NAME_ALIAS = "budget.name.original";
    private static final String UPDATED_NAME_ALIAS = "budget.name.updated";

    public void addBudget(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        openCreateBudgetForm();
        fillBudgetForm(values);
        submitBudget();
        putAlias(ORIGINAL_NAME_ALIAS, values.get("budgetName"));
    }

    public void editBudget(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        fillBudgetForm(values);
        submitBudget();
        String updatedName = values.getOrDefault("budgetName", currentBudgetName());
        putAlias(UPDATED_NAME_ALIAS, updatedName);
    }

    public void deleteCurrentBudget() {
        BddWorld.uiActionExecutor().clickAction("budget.delete.confirm");
    }

    public boolean isBudgetVisible() {
        String name = currentBudgetName();
        return BddWorld.testContext().uiEngine().elements()
                .exists(com.jaya.automation.core.ui.Locator.text(name));
    }

    public boolean isBudgetDeleted() {
        return !isBudgetVisible();
    }

    private void openCreateBudgetForm() {
        try {
            BddWorld.uiActionExecutor().clickAction("budget.create.new");
        } catch (RuntimeException ex) {
            String baseUrl = BddWorld.config().baseUrl();
            String normalized = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
            BddWorld.testContext().uiEngine().navigateTo(normalized + "/budget/create");
        }
    }

    private void fillBudgetForm(Map<String, String> values) {
        Map<String, String> fieldValues = new LinkedHashMap<>();
        putField(fieldValues, "budget.name", values.get("budgetName"));
        putField(fieldValues, "budget.amount", values.get("amount"));
        putField(fieldValues, "budget.startDate", values.get("startDate"));
        putField(fieldValues, "budget.endDate", values.get("endDate"));
        putField(fieldValues, "budget.description", values.get("description"));
        if (!fieldValues.isEmpty()) {
            BddWorld.uiActionExecutor().fillFields(fieldValues);
        }
    }

    private void submitBudget() {
        BddWorld.uiActionExecutor().clickAction("budget.submit");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    private String currentBudgetName() {
        return BddWorld.aliasValue(UPDATED_NAME_ALIAS)
                .or(() -> BddWorld.aliasValue(ORIGINAL_NAME_ALIAS))
                .map(String::valueOf)
                .orElseThrow(() -> new IllegalStateException("Missing budget name alias"));
    }

    private void putField(Map<String, String> fieldValues, String key, String value) {
        if (value != null && !value.isBlank()) {
            fieldValues.put(key, value);
        }
    }

    private void putAlias(String key, String value) {
        if (value != null && !value.isBlank()) {
            BddWorld.putAliasValue(key, value);
        }
    }

    private Map<String, String> resolveValues(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> resolved = new LinkedHashMap<>();
        rawValues.forEach((key, value) -> resolved.put(key, resolver.apply(value)));
        return resolved;
    }
}
