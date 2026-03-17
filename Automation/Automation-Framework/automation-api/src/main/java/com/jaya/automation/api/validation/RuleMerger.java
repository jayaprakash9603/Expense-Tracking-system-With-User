package com.jaya.automation.api.validation;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class RuleMerger {

    private RuleMerger() {
    }

    public static List<ValidationRule> merge(List<ValidationRule> baseRules, List<ValidationRule> overrideRules) {
        if (overrideRules == null || overrideRules.isEmpty()) {
            return baseRules;
        }
        if (baseRules == null || baseRules.isEmpty()) {
            return overrideRules;
        }

        Map<String, ValidationRule> merged = new LinkedHashMap<>();
        for (ValidationRule rule : baseRules) {
            merged.put(rule.name(), rule);
        }
        for (ValidationRule rule : overrideRules) {
            merged.put(rule.name(), rule);
        }
        return new ArrayList<>(merged.values());
    }
}
