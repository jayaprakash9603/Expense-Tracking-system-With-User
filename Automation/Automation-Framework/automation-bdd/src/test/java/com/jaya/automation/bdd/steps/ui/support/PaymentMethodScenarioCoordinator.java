package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.bdd.context.BddWorld;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;

public final class PaymentMethodScenarioCoordinator {
    private static final String ORIGINAL_NAME_ALIAS = "payment.name.original";
    private static final String UPDATED_NAME_ALIAS = "payment.name.updated";

    public void addPaymentMethod(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        openCreateForm();
        fillForm(values);
        submit();
        putAlias(ORIGINAL_NAME_ALIAS, values.get("name"));
    }

    public void editPaymentMethod(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        fillForm(values);
        submit();
        putAlias(UPDATED_NAME_ALIAS, values.getOrDefault("name", currentName()));
    }

    public void deleteCurrentPaymentMethod() {
        BddWorld.uiActionExecutor().clickAction("payment.delete.confirm");
    }

    public boolean isPaymentMethodVisible() {
        return BddWorld.testContext().uiEngine().elements()
                .exists(com.jaya.automation.core.ui.Locator.text(currentName()));
    }

    private void openCreateForm() {
        try {
            BddWorld.uiActionExecutor().clickAction("payment.create.new");
        } catch (RuntimeException ex) {
            String baseUrl = BddWorld.config().baseUrl();
            String normalized = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
            BddWorld.testContext().uiEngine().navigateTo(normalized + "/payment-method/create");
        }
    }

    private void fillForm(Map<String, String> values) {
        Map<String, String> fieldValues = new LinkedHashMap<>();
        putField(fieldValues, "payment.name", values.get("name"));
        putField(fieldValues, "payment.type", values.get("type"));
        if (!fieldValues.isEmpty()) {
            BddWorld.uiActionExecutor().fillFields(fieldValues);
        }
    }

    private void submit() {
        BddWorld.uiActionExecutor().clickAction("payment.submit");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    private String currentName() {
        return BddWorld.aliasValue(UPDATED_NAME_ALIAS)
                .or(() -> BddWorld.aliasValue(ORIGINAL_NAME_ALIAS))
                .map(String::valueOf)
                .orElseThrow(() -> new IllegalStateException("Missing payment method name alias"));
    }

    private void putField(Map<String, String> m, String k, String v) {
        if (v != null && !v.isBlank()) m.put(k, v);
    }

    private void putAlias(String k, String v) {
        if (v != null && !v.isBlank()) BddWorld.putAliasValue(k, v);
    }

    private Map<String, String> resolveValues(Map<String, String> raw, Function<String, String> resolver) {
        Map<String, String> resolved = new LinkedHashMap<>();
        raw.forEach((key, value) -> resolved.put(key, resolver.apply(value)));
        return resolved;
    }
}
