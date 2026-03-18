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
        String[] credentials = resolveCredentials();
        return signIn(credentials[0], credentials[1]);
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

    private String[] resolveCredentials() {
        if (automationConfig.hasCredentials()) {
            return new String[]{automationConfig.testUsername(), automationConfig.testPassword()};
        }
        throw new IllegalStateException(
                "No credentials found. Set TEST_USERNAME/TEST_PASSWORD via Helm values, CLI, env, "
                        + "or automation.properties");
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
