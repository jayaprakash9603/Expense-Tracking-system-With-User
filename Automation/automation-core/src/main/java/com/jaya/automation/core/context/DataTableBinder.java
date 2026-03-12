package com.jaya.automation.core.context;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class DataTableBinder {
    public Map<String, String> bindAsTextMap(List<Map<String, String>> rows, DynamicValueResolver valueResolver) {
        if (rows.isEmpty()) {
            return Map.of();
        }
        if (isKeyValueRows(rows)) {
            return resolveValues(keyValueMap(rows), valueResolver);
        }
        return resolveValues(rows.get(0), valueResolver);
    }

    public List<Map<String, String>> bindAsTextRows(List<Map<String, String>> rows, DynamicValueResolver valueResolver) {
        List<Map<String, String>> resolvedRows = new ArrayList<>();
        rows.forEach(row -> resolvedRows.add(resolveValues(row, valueResolver)));
        return resolvedRows;
    }

    public Map<String, Object> bindAsObjectMap(List<Map<String, String>> rows, DynamicValueResolver valueResolver) {
        return toObjectMap(bindAsTextMap(rows, valueResolver));
    }

    public Map<String, Object> toObjectMap(Map<String, String> values) {
        Map<String, Object> objectMap = new LinkedHashMap<>();
        values.forEach((key, value) -> objectMap.put(key, parseValue(value)));
        return objectMap;
    }

    private Map<String, String> keyValueMap(List<Map<String, String>> rows) {
        Map<String, String> values = new LinkedHashMap<>();
        for (Map<String, String> row : rows) {
            values.put(safe(row.get("key")), safe(row.get("value")));
        }
        return values;
    }

    private boolean isKeyValueRows(List<Map<String, String>> rows) {
        return rows.stream().allMatch(row -> row.containsKey("key") && row.containsKey("value"));
    }

    private Map<String, String> resolveValues(Map<String, String> source, DynamicValueResolver valueResolver) {
        Map<String, String> normalized = new LinkedHashMap<>();
        source.forEach((key, value) -> normalized.put(key, safe(value)));
        return valueResolver.resolveTextMap(normalized);
    }

    private Object parseValue(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        if ("null".equalsIgnoreCase(value)) {
            return null;
        }
        if ("true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) {
            return Boolean.parseBoolean(value);
        }
        if (value.matches("-?\\d+")) {
            return parseLong(value);
        }
        if (value.matches("-?\\d+\\.\\d+")) {
            return Double.parseDouble(value);
        }
        return value;
    }

    private Object parseLong(String value) {
        long parsedValue = Long.parseLong(value);
        if (parsedValue >= Integer.MIN_VALUE && parsedValue <= Integer.MAX_VALUE) {
            return (int) parsedValue;
        }
        return parsedValue;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
