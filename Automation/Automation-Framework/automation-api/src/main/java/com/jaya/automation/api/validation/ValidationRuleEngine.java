package com.jaya.automation.api.validation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class ValidationRuleEngine {

    private static final Logger LOG = LoggerFactory.getLogger(ValidationRuleEngine.class);
    private static final String RULES_BASE_PATH = "rules/";

    private ValidationRuleEngine() {
    }

    public static List<RuleEvaluator.RuleResult> validate(
            String serviceName,
            String operationName,
            Map<String, String> contextJsons
    ) {
        return validate(serviceName, operationName, null, contextJsons);
    }

    public static List<RuleEvaluator.RuleResult> validate(
            String serviceName,
            String operationName,
            String overrideScenario,
            Map<String, String> contextJsons
    ) {
        String basePath = RULES_BASE_PATH + serviceName + "/base/" + operationName + "_BASE.yml";
        List<ValidationRule> baseRules = RuleLoader.load(basePath);
        LOG.debug("Loaded {} BASE rules from {}", baseRules.size(), basePath);

        List<ValidationRule> effectiveRules;
        if (overrideScenario != null && !overrideScenario.isBlank()) {
            String overridePath = RULES_BASE_PATH + serviceName + "/"
                    + overrideScenario + "/" + operationName + "_OVERRIDE.yml";
            List<ValidationRule> overrideRules = RuleLoader.load(overridePath);
            LOG.debug("Loaded {} OVERRIDE rules from {}", overrideRules.size(), overridePath);
            effectiveRules = RuleMerger.merge(baseRules, overrideRules);
        } else {
            effectiveRules = baseRules;
        }

        if (effectiveRules.isEmpty()) {
            throw new IllegalStateException(
                    "No validation rules found for service=" + serviceName + ", operation=" + operationName);
        }

        List<RuleEvaluator.RuleResult> results = RuleEvaluator.evaluate(effectiveRules, contextJsons);
        List<RuleEvaluator.RuleResult> failures = results.stream()
                .filter(r -> !r.passed())
                .toList();

        if (!failures.isEmpty()) {
            String failureReport = failures.stream()
                    .map(f -> " - " + f.failureMessage())
                    .collect(Collectors.joining("\n"));
            LOG.error("Validation failed ({}/{}):\n{}", serviceName, operationName, failureReport);
        } else {
            LOG.info("All {} validation rules passed for {}/{}", results.size(), serviceName, operationName);
        }

        return results;
    }

    public static void assertAllPassed(List<RuleEvaluator.RuleResult> results) {
        List<RuleEvaluator.RuleResult> failures = results.stream()
                .filter(r -> !r.passed())
                .toList();
        if (!failures.isEmpty()) {
            String report = failures.stream()
                    .map(f -> " - " + f.failureMessage())
                    .collect(Collectors.joining("\n"));
            throw new AssertionError("Validation rule failures:\n" + report);
        }
    }
}
