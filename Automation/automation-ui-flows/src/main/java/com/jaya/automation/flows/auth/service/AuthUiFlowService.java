package com.jaya.automation.flows.auth.service;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.auth.model.LoginCredentials;
import com.jaya.automation.flows.auth.page.LoginPage;
import com.jaya.automation.flows.auth.provider.MfaProvider;
import com.jaya.automation.flows.auth.provider.NoOpMfaProvider;
import com.jaya.automation.flows.auth.provider.NoOpOtpProvider;
import com.jaya.automation.flows.auth.provider.OtpProvider;

import java.util.Optional;

public final class AuthUiFlowService {
    private final UiEngine uiEngine;
    private final LoginPage loginPage;
    private final OtpProvider otpProvider;
    private final MfaProvider mfaProvider;

    public AuthUiFlowService(UiEngine uiEngine) {
        this(uiEngine, new NoOpOtpProvider(), new NoOpMfaProvider());
    }

    public AuthUiFlowService(UiEngine uiEngine, OtpProvider otpProvider, MfaProvider mfaProvider) {
        this.uiEngine = uiEngine;
        this.loginPage = new LoginPage(uiEngine);
        this.otpProvider = otpProvider;
        this.mfaProvider = mfaProvider;
    }

    public String loginSuccessfully(String baseUrl, LoginCredentials credentials) {
        loginPage.open(baseUrl);
        loginPage.submitCredentials(credentials);
        uiEngine.waits().forUrlContains("/dashboard");
        return uiEngine.currentUrl();
    }

    public String loginExpectingError(String baseUrl, LoginCredentials credentials, String expectedMessage) {
        loginPage.open(baseUrl);
        loginPage.submitCredentials(credentials);
        String errorMessage = loginPage.readErrorMessage();
        validateErrorContains(errorMessage, expectedMessage);
        return errorMessage;
    }

    public Optional<String> resolveOtpHook(String username) {
        return otpProvider.resolveLoginOtp(username);
    }

    public Optional<String> resolveMfaHook(String username, String mfaToken, boolean backupCode) {
        return mfaProvider.resolveMfaCode(username, mfaToken, backupCode);
    }

    private void validateErrorContains(String actualMessage, String expectedMessage) {
        if (expectedMessage == null || expectedMessage.isBlank()) {
            return;
        }
        if (!actualMessage.contains(expectedMessage)) {
            throw new IllegalStateException("Expected error to contain '" + expectedMessage + "' but got '" + actualMessage + "'");
        }
    }
}
