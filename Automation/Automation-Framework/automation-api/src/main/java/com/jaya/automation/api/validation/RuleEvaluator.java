package com.jaya.automation.api.validation;

import io.restassured.path.json.JsonPath;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class RuleEvaluator {

    private static final Logger LOG = LoggerFactory.getLogger(RuleEvaluator.class);
    private static final Pattern JSON_PATH_PATTERN = Pattern.compile(
            "#jsonPath\\(\\[([^]]+)]\\s*,\\s*'([^']+)'\\)");

    private RuleEvaluator() {
    }

    public static List<RuleResult> evaluate(
            List<ValidationRule> rules,
            Map<String, String> contextJsons
    ) {
        List<RuleResult> results = new ArrayList<>();
        for (ValidationRule rule : rules) {
            results.add(evaluateSingle(rule, contextJsons));
        }
        return results;
    }

    private static RuleResult evaluateSingle(ValidationRule rule, Map<String, String> contextJsons) {
        try {
            String sourceValue = resolveExpression(rule.condition().source(), contextJsons);
            String operator = rule.condition().operator();
            String targetValue = rule.condition().target() != null
                    ? resolveExpression(rule.condition().target(), contextJsons)
                    : null;
            boolean passed = applyOperator(operator, sourceValue, targetValue);
            return new RuleResult(rule.name(), rule.description(), passed,
                    passed ? null : buildFailureMessage(rule, sourceValue, targetValue));
        } catch (Exception ex) {
            LOG.warn("Rule evaluation failed for '{}': {}", rule.name(), ex.getMessage());
            return new RuleResult(rule.name(), rule.description(), false,
                    "Evaluation error: " + ex.getMessage());
        }
    }

    private static String resolveExpression(String expression, Map<String, String> contextJsons) {
        if (expression == null) {
            return null;
        }
        Matcher matcher = JSON_PATH_PATTERN.matcher(expression);
        if (!matcher.matches()) {
            return expression;
        }
        String contextKey = matcher.group(1);
        String jsonPathExpr = matcher.group(2);
        String json = contextJsons.get(contextKey);
        if (json == null) {
            throw new IllegalArgumentException("Context key not found: " + contextKey);
        }
        Object result = readJsonPath(json, jsonPathExpr);
        return result != null ? result.toString() : null;
    }

    private static Object readJsonPath(String json, String jsonPathExpr) {
        JsonPath jsonPath = JsonPath.from(json);
        Object result = jsonPath.get(jsonPathExpr);
        if (result == null && jsonPathExpr.startsWith("$.")) {
            result = jsonPath.get(jsonPathExpr.substring(2));
        }
        return result;
    }

    private static boolean applyOperator(String operator, String source, String target) {
        return switch (operator.toLowerCase()) {
            case "notnull", "not_null" -> source != null && !source.isBlank();
            case "isnull", "is_null" -> source == null || source.isBlank();
            case "equalto", "equal_to", "equals" -> source != null && source.equals(target);
            case "notequalto", "not_equal_to", "notequals" -> source == null || !source.equals(target);
            case "contains" -> source != null && target != null && source.contains(target);
            case "notcontains", "not_contains" -> source == null || target == null || !source.contains(target);
            case "startswith", "starts_with" -> source != null && target != null && source.startsWith(target);
            case "endswith", "ends_with" -> source != null && target != null && source.endsWith(target);
            case "in" -> source != null && target != null && target.contains(source);
            case "matches" -> source != null && target != null && source.matches(target);
            case "greaterthan", "greater_than", "gt" ->
                    source != null && target != null && Double.parseDouble(source) > Double.parseDouble(target);
            case "lessthan", "less_than", "lt" ->
                    source != null && target != null && Double.parseDouble(source) < Double.parseDouble(target);
            default -> throw new IllegalArgumentException("Unknown operator: " + operator);
        };
    }

    private static String buildFailureMessage(ValidationRule rule, String sourceValue, String targetValue) {
        StringBuilder sb = new StringBuilder();
        sb.append("Rule '").append(rule.name()).append("' failed: ");
        sb.append("source=").append(sourceValue);
        sb.append(", operator=").append(rule.condition().operator());
        if (targetValue != null) {
            sb.append(", target=").append(targetValue);
        }
        return sb.toString();
    }

    public record RuleResult(String ruleName, String description, boolean passed, String failureMessage) {
    }
}
