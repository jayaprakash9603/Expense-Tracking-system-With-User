package com.jaya.automation.api.util;

import com.jaya.automation.api.client.AuthApiClient;
import com.jaya.automation.api.model.AuthSigninRequest;
import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public final class SessionTokenHelper {
    private static final String SUITE_DATA_PATH = "config/suite-data.properties";
    private static final String SUITE_USERNAME_KEY = "auth.username";
    private static final String SUITE_PASSWORD_KEY = "auth.password";

    private final AutomationConfig automationConfig;
    private final AuthApiClient authApiClient;
    private volatile String[] suiteDataCredentials;

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
        String[] fallback = loadSuiteDataCredentials();
        if (fallback != null) {
            return fallback;
        }
        throw new IllegalStateException(
                "No credentials found. Set TEST_USERNAME/TEST_PASSWORD via CLI, env, or automation.properties, "
                        + "or provide auth.username/auth.password in " + SUITE_DATA_PATH);
    }

    private String[] loadSuiteDataCredentials() {
        if (suiteDataCredentials != null) {
            return suiteDataCredentials;
        }
        Properties props = new Properties();
        try (InputStream stream = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream(SUITE_DATA_PATH)) {
            if (stream == null) {
                return null;
            }
            props.load(stream);
        } catch (IOException ex) {
            return null;
        }
        String username = props.getProperty(SUITE_USERNAME_KEY, "").trim();
        String password = props.getProperty(SUITE_PASSWORD_KEY, "").trim();
        if (username.isEmpty() || password.isEmpty()) {
            return null;
        }
        suiteDataCredentials = new String[]{username, password};
        return suiteDataCredentials;
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
