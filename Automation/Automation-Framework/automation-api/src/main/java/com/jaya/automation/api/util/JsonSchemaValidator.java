package com.jaya.automation.api.util;

import com.jaya.automation.api.execution.ApiExecutionResult;

public final class JsonSchemaValidator {
    public void assertSchema(ApiExecutionResult result, String schemaPath) {
        result.response().then()
                .assertThat()
                .body(io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath(cleanPath(schemaPath)));
    }

    private String cleanPath(String schemaPath) {
        if (schemaPath == null || schemaPath.isBlank()) {
            throw new IllegalArgumentException("Schema path cannot be blank");
        }
        if (schemaPath.startsWith("/")) {
            return schemaPath.substring(1);
        }
        return schemaPath;
    }
}
