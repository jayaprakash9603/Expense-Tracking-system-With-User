package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.bdd.context.BddWorld;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;

public final class BillScenarioCoordinator {
    private static final String ORIGINAL_NAME_ALIAS = "bill.name.original";
    private static final String UPDATED_NAME_ALIAS = "bill.name.updated";

    public void addBill(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        openCreateBillForm();
        fillBillForm(values);
        submitBill();
        putAlias(ORIGINAL_NAME_ALIAS, values.get("billName"));
    }

    public void editBill(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        fillBillForm(values);
        submitBill();
        String updatedName = values.getOrDefault("billName", currentBillName());
        putAlias(UPDATED_NAME_ALIAS, updatedName);
    }

    public void deleteCurrentBill() {
        BddWorld.uiActionExecutor().clickAction("bill.delete.confirm");
    }

    public boolean isBillVisible() {
        String name = currentBillName();
        return BddWorld.testContext().uiEngine().elements()
                .exists(com.jaya.automation.core.ui.Locator.text(name));
    }

    private void openCreateBillForm() {
        try {
            BddWorld.uiActionExecutor().clickAction("bill.create.new");
        } catch (RuntimeException ex) {
            String baseUrl = BddWorld.config().baseUrl();
            String normalized = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
            BddWorld.testContext().uiEngine().navigateTo(normalized + "/bill/create");
        }
    }

    private void fillBillForm(Map<String, String> values) {
        Map<String, String> fieldValues = new LinkedHashMap<>();
        putField(fieldValues, "bill.name", values.get("billName"));
        putField(fieldValues, "bill.description", values.get("description"));
        putField(fieldValues, "bill.type", values.get("type"));
        if (!fieldValues.isEmpty()) {
            BddWorld.uiActionExecutor().fillFields(fieldValues);
        }
    }

    private void submitBill() {
        BddWorld.uiActionExecutor().clickAction("bill.submit");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    private String currentBillName() {
        return BddWorld.aliasValue(UPDATED_NAME_ALIAS)
                .or(() -> BddWorld.aliasValue(ORIGINAL_NAME_ALIAS))
                .map(String::valueOf)
                .orElseThrow(() -> new IllegalStateException("Missing bill name alias"));
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
