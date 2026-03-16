package com.jaya.automation.core.config;

import java.time.Duration;

public record AutomationConfig(
        AutomationEngine automationEngine,
        EnvironmentType environmentType,
        String baseUrl,
        String apiBaseUrl,
        BrowserType browserType,
        boolean headless,
        Duration explicitWait,
        int retryCount,
        String testUsername,
        String testPassword,
        String otpProvider,
        String mfaProvider,
        int parallelThreads,
        RunnerSettings runnerSettings,
        RetrySettings retrySettings,
        ArtifactSettings artifactSettings,
        DataSettings dataSettings,
        ObservabilitySettings observabilitySettings,
        AppBootstrapSettings appBootstrapSettings
) {
    public boolean hasCredentials() {
        return hasValue(testUsername) && hasValue(testPassword);
    }

    public boolean hasOtpProvider() {
        return hasValue(otpProvider);
    }

    public boolean hasMfaProvider() {
        return hasValue(mfaProvider);
    }

    public boolean hasDataset() {
        return dataSettings != null && dataSettings.isEnabled();
    }

    private boolean hasValue(String value) {
        return value != null && !value.isBlank();
    }
}
