package com.jaya.automation.api.util;

import com.jaya.automation.api.execution.ApiExecutionResult;

public final class SchemaValidator {
    private final JsonSchemaValidator jsonSchemaValidator;

    public SchemaValidator(JsonSchemaValidator jsonSchemaValidator) {
        this.jsonSchemaValidator = jsonSchemaValidator;
    }

    public void validate(ApiExecutionResult result, String schemaPath) {
        jsonSchemaValidator.assertSchema(result, schemaPath);
    }
}
