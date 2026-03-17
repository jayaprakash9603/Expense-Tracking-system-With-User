package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.bdd.context.BddWorld;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;

public final class CategoryScenarioCoordinator {
    private static final String ORIGINAL_NAME_ALIAS = "category.name.original";
    private static final String UPDATED_NAME_ALIAS = "category.name.updated";

    public void addCategory(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        openCreateCategoryForm();
        fillCategoryForm(values);
        submitCategory();
        putAlias(ORIGINAL_NAME_ALIAS, values.get("categoryName"));
    }

    public void editCategory(Map<String, String> rawValues, Function<String, String> resolver) {
        Map<String, String> values = resolveValues(rawValues, resolver);
        fillCategoryForm(values);
        submitCategory();
        putAlias(UPDATED_NAME_ALIAS, values.getOrDefault("categoryName", currentName()));
    }

    public void deleteCurrentCategory() {
        BddWorld.uiActionExecutor().clickAction("category.delete.confirm");
    }

    public boolean isCategoryVisible() {
        return BddWorld.testContext().uiEngine().elements()
                .exists(com.jaya.automation.core.ui.Locator.text(currentName()));
    }

    private void openCreateCategoryForm() {
        try {
            BddWorld.uiActionExecutor().clickAction("category.create.new");
        } catch (RuntimeException ex) {
            String baseUrl = BddWorld.config().baseUrl();
            String normalized = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
            BddWorld.testContext().uiEngine().navigateTo(normalized + "/category-flow/create");
        }
    }

    private void fillCategoryForm(Map<String, String> values) {
        Map<String, String> fieldValues = new LinkedHashMap<>();
        putField(fieldValues, "category.name", values.get("categoryName"));
        putField(fieldValues, "category.description", values.get("description"));
        putField(fieldValues, "category.type", values.get("type"));
        if (!fieldValues.isEmpty()) {
            BddWorld.uiActionExecutor().fillFields(fieldValues);
        }
    }

    private void submitCategory() {
        BddWorld.uiActionExecutor().clickAction("category.submit");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    private String currentName() {
        return BddWorld.aliasValue(UPDATED_NAME_ALIAS)
                .or(() -> BddWorld.aliasValue(ORIGINAL_NAME_ALIAS))
                .map(String::valueOf)
                .orElseThrow(() -> new IllegalStateException("Missing category name alias"));
    }

    private void putField(Map<String, String> m, String key, String value) {
        if (value != null && !value.isBlank()) m.put(key, value);
    }

    private void putAlias(String key, String value) {
        if (value != null && !value.isBlank()) BddWorld.putAliasValue(key, value);
    }

    private Map<String, String> resolveValues(Map<String, String> raw, Function<String, String> resolver) {
        Map<String, String> resolved = new LinkedHashMap<>();
        raw.forEach((key, value) -> resolved.put(key, resolver.apply(value)));
        return resolved;
    }
}
