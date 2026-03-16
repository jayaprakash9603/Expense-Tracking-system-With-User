package com.jaya.automation.api.util;

import com.jaya.automation.api.model.AuthSigninRequest;
import com.jaya.automation.core.config.AutomationConfig;

import java.util.UUID;

public final class TestUserDataFactory {
    private TestUserDataFactory() {
    }

    public static AuthSigninRequest configuredUser(AutomationConfig automationConfig) {
        return new AuthSigninRequest(automationConfig.testUsername(), automationConfig.testPassword());
    }

    public static AuthSigninRequest invalidUser() {
        String randomEmail = "invalid+" + UUID.randomUUID() + "@example.test";
        return new AuthSigninRequest(randomEmail, "invalid-password");
    }
}
