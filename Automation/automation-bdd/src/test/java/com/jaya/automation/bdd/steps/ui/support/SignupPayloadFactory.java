package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.flows.auth.model.SignupData;

import java.util.Map;
import java.util.function.Function;

public final class SignupPayloadFactory {
    public SignupData valid(Map<String, String> dataRow, Function<String, String> dynamicResolver) {
        return new SignupData(
                resolve(dataRow, "signup_first_name", "Auto", dynamicResolver),
                resolve(dataRow, "signup_last_name", "User", dynamicResolver),
                resolve(dataRow, "signup_email", "${random.email}", dynamicResolver),
                resolve(dataRow, "signup_password", "Valid@1234", dynamicResolver)
        );
    }

    public SignupData missingMandatory(Map<String, String> dataRow, Function<String, String> dynamicResolver) {
        return new SignupData(
                resolve(dataRow, "missing_signup_first_name", "", dynamicResolver),
                resolve(dataRow, "missing_signup_last_name", "", dynamicResolver),
                resolve(dataRow, "missing_signup_email", "", dynamicResolver),
                resolve(dataRow, "missing_signup_password", "", dynamicResolver)
        );
    }

    private String resolve(
            Map<String, String> dataRow,
            String key,
            String fallback,
            Function<String, String> dynamicResolver
    ) {
        String rawValue = dataRow.get(key);
        String value = rawValue == null || rawValue.isBlank() ? fallback : rawValue;
        return dynamicResolver.apply(value);
    }
}
