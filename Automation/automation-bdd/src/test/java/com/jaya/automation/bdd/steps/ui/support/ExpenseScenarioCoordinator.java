package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.flows.expenses.page.ExpensesPage;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

public final class ExpenseScenarioCoordinator {
    private static final String ORIGINAL_NAME_ALIAS = "expense.name.original";
    private static final String UPDATED_NAME_ALIAS = "expense.name.updated";
    private static final String ORIGINAL_AMOUNT_ALIAS = "expense.amount.original";
    private static final String UPDATED_AMOUNT_ALIAS = "expense.amount.updated";

    public void addExpense(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        openCreateExpenseForm();
        ensureExpenseFormReady();
        fillExpenseForm(values);
        submitExpense();
        rememberOriginalAliases(values);
    }

    public void editExpense(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        expensesPage().clickExpenseRowByName(currentExpenseName());
        BddWorld.uiActionExecutor().clickAction("expense.edit");
        fillExpenseForm(values);
        submitExpense();
        rememberUpdatedAliases(values);
    }

    public void deleteCurrentExpense() {
        expensesPage().clickExpenseRowByName(currentExpenseName());
        BddWorld.uiActionExecutor().clickAction("expense.delete");
        BddWorld.uiActionExecutor().clickAction("expense.delete.confirm");
    }

    public boolean isOriginalExpenseVisible() {
        return expensesPage().isExpenseRowVisible(aliasValue(ORIGINAL_NAME_ALIAS));
    }

    public boolean isUpdatedExpenseVisible() {
        return expensesPage().isExpenseRowVisible(aliasValue(UPDATED_NAME_ALIAS));
    }

    public boolean isExpenseDeleted() {
        return !expensesPage().isExpenseRowVisible(currentExpenseName());
    }

    private void openCreateExpenseForm() {
        try {
            BddWorld.uiActionExecutor().clickAction("expense.add.new");
            BddWorld.uiActionExecutor().clickAction("expense.open.add");
        } catch (RuntimeException exception) {
            openCreateExpensePageDirectly();
        }
    }

    private void ensureExpenseFormReady() {
        if (BddWorld.testContext().uiEngine().elements().exists(Locator.css("input[aria-label='Enter expense name']"))) {
            return;
        }
        if (BddWorld.testContext().uiEngine().elements().exists(Locator.css("#expenseName"))) {
            return;
        }
        openCreateExpensePageDirectly();
    }

    private void openCreateExpensePageDirectly() {
        String baseUrl = BddWorld.config().baseUrl();
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        BddWorld.testContext().uiEngine().navigateTo(normalizedBaseUrl + "/expenses/create");
    }

    private void fillExpenseForm(Map<String, String> values) {
        Map<String, String> fieldValues = buildFieldMap(values);
        if (!fieldValues.isEmpty()) {
            BddWorld.uiActionExecutor().fillFields(fieldValues);
        }
        selectOption("expense.category", values.get("category"));
        selectOption("expense.payment.method", values.get("paymentMethod"));
    }

    private Map<String, String> buildFieldMap(Map<String, String> values) {
        Map<String, String> fieldValues = new LinkedHashMap<>();
        putField(fieldValues, "expense.name", values.get("expenseName"));
        putField(fieldValues, "expense.amount", values.get("amount"));
        putField(fieldValues, "expense.comments", values.get("comments"));
        putField(fieldValues, "expense.date", values.get("date"));
        return fieldValues;
    }

    private void putField(Map<String, String> fieldValues, String key, String value) {
        if (value != null && !value.isBlank()) {
            fieldValues.put(key, value);
        }
    }

    private void selectOption(String fieldKey, String optionValue) {
        if (optionValue == null || optionValue.isBlank()) {
            return;
        }
        BddWorld.uiActionExecutor().fillFields(Map.of(fieldKey, optionValue));
        BddWorld.testContext().uiEngine().elements().click(Locator.text(optionValue));
    }

    private void submitExpense() {
        BddWorld.uiActionExecutor().clickAction("expense.submit");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    private void rememberOriginalAliases(Map<String, String> values) {
        putAlias(ORIGINAL_NAME_ALIAS, values.get("expenseName"));
        putAlias(ORIGINAL_AMOUNT_ALIAS, values.get("amount"));
    }

    private void rememberUpdatedAliases(Map<String, String> values) {
        String updatedName = Optional.ofNullable(values.get("expenseName"))
                .filter(value -> !value.isBlank())
                .orElse(currentExpenseName());
        putAlias(UPDATED_NAME_ALIAS, updatedName);
        putAlias(UPDATED_AMOUNT_ALIAS, values.get("amount"));
    }

    private void putAlias(String aliasKey, String value) {
        if (value != null && !value.isBlank()) {
            BddWorld.putAliasValue(aliasKey, value);
        }
    }

    private String currentExpenseName() {
        return aliasValue(UPDATED_NAME_ALIAS, ORIGINAL_NAME_ALIAS);
    }

    private String aliasValue(String primaryAlias, String fallbackAlias) {
        return BddWorld.aliasValue(primaryAlias)
                .or(() -> BddWorld.aliasValue(fallbackAlias))
                .map(String::valueOf)
                .orElseThrow(() -> new IllegalStateException("Missing expense alias: " + primaryAlias));
    }

    private String aliasValue(String aliasKey) {
        return BddWorld.aliasValue(aliasKey)
                .map(String::valueOf)
                .orElseThrow(() -> new IllegalStateException("Missing expense alias: " + aliasKey));
    }

    private ExpensesPage expensesPage() {
        return BddWorld.domainNavigationFlow().expenses();
    }

    private Map<String, String> resolveValues(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> resolved = new LinkedHashMap<>();
        rawValues.forEach((key, value) -> resolved.put(key, resolver.apply(value)));
        return resolved;
    }
}
