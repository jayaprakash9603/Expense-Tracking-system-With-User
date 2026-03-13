package com.jaya.automation.api.util;

import com.jaya.automation.api.client.AuthApiClient;
import com.jaya.automation.api.model.AuthSigninRequest;
import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;

public final class SessionTokenHelper {
    private final AutomationConfig automationConfig;
    private final AuthApiClient authApiClient;

    public SessionTokenHelper(AutomationConfig automationConfig, AuthApiClient authApiClient) {
        this.automationConfig = automationConfig;
        this.authApiClient = authApiClient;
    }

    public String signInWithConfiguredUser() {
        ensureCredentials();
        return signIn(automationConfig.testUsername(), automationConfig.testPassword());
    }

    public String signIn(String username, String password) {
        Response response = authApiClient.signInRaw(new AuthSigninRequest(username, password));
        String jwt = stringValue(response, "jwt");
        if (jwt != null && !jwt.isBlank()) {
            return jwt;
        }
        String message = firstNonBlank(
                stringValue(response, "message"),
                stringValue(response, "error"),
                stringValue(response, "details")
        );
        if (message == null || message.isBlank()) {
            message = response.body().asString();
        }
        throw new IllegalStateException("Signin failed with status " + response.statusCode() + ": " + message);
    }

    private void ensureCredentials() {
        if (automationConfig.hasCredentials()) {
            return;
        }
        throw new IllegalStateException("TEST_USERNAME and TEST_PASSWORD are required for signin flows");
    }

    private String stringValue(Response response, String path) {
        try {
            Object value = response.jsonPath().get(path);
            return value == null ? null : String.valueOf(value);
        } catch (Exception exception) {
            return null;
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
