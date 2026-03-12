package com.jaya.automation.api.util;

import com.jaya.automation.api.client.AuthApiClient;
import com.jaya.automation.api.model.AuthSigninRequest;
import com.jaya.automation.api.model.AuthSigninResponse;
import com.jaya.automation.core.config.AutomationConfig;

public final class SessionTokenHelper {
    private final AutomationConfig automationConfig;
    private final AuthApiClient authApiClient;

    public SessionTokenHelper(AutomationConfig automationConfig, AuthApiClient authApiClient) {
        this.automationConfig = automationConfig;
        this.authApiClient = authApiClient;
    }

    public String signInWithConfiguredUser() {
        ensureCredentials();
        AuthSigninRequest request = new AuthSigninRequest(
                automationConfig.testUsername(),
                automationConfig.testPassword()
        );
        AuthSigninResponse response = authApiClient.signIn(request);
        return extractJwt(response);
    }

    public String signIn(String username, String password) {
        AuthSigninResponse response = authApiClient.signIn(new AuthSigninRequest(username, password));
        return extractJwt(response);
    }

    private void ensureCredentials() {
        if (automationConfig.hasCredentials()) {
            return;
        }
        throw new IllegalStateException("TEST_USERNAME and TEST_PASSWORD are required for signin flows");
    }

    private String extractJwt(AuthSigninResponse response) {
        if (response.getJwt() != null && !response.getJwt().isBlank()) {
            return response.getJwt();
        }
        throw new IllegalStateException("Signin response does not contain jwt token");
    }
}
