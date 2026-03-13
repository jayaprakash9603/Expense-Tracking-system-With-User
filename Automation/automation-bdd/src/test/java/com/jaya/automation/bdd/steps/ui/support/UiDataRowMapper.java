package com.jaya.automation.bdd.steps.ui.support;

import java.util.LinkedHashMap;
import java.util.Map;

public final class UiDataRowMapper {
    public Map<String, String> extractUiValues(Map<String, String> allValues) {
        Map<String, String> uiValues = new LinkedHashMap<>();
        allValues.forEach((key, value) -> {
            if (key.startsWith("ui.")) {
                uiValues.put(key.substring(3), value);
            }
        });
        if (!uiValues.isEmpty()) {
            return uiValues;
        }
        return allValues;
    }
}
