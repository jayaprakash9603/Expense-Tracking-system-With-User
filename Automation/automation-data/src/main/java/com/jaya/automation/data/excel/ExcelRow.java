package com.jaya.automation.data.excel;

import java.util.Map;

public record ExcelRow(int rowNumber, Map<String, String> values) {
    public String get(String key) {
        return values.getOrDefault(key, "");
    }
}
