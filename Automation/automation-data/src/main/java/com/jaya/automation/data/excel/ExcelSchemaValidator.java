package com.jaya.automation.data.excel;

import java.util.List;

public final class ExcelSchemaValidator {
    private ExcelSchemaValidator() {
    }

    public static void validateHeaders(List<String> headers) {
        if (headers.isEmpty()) {
            throw new IllegalStateException("Excel sheet must contain header row");
        }
        if (!headers.contains("scenario")) {
            throw new IllegalStateException("Excel sheet must contain 'scenario' header");
        }
    }
}
