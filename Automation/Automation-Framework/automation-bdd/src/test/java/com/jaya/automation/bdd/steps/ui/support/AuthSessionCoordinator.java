package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.hooks.ApiCleanupHooks;
import com.jaya.automation.flows.auth.model.LoginCredentials;
import com.jaya.automation.flows.auth.model.SignupData;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class AuthSessionCoordinator {
    private static final Map<Long, String> THREAD_SIGNUP_EMAIL = new ConcurrentHashMap<>();
    private static final Map<Long, String> THREAD_SIGNUP_PASSWORD = new ConcurrentHashMap<>();

    public void ensureAuthenticatedDashboardSession(SignupData signupData) {
        BddWorld.authUiFlowService();
        if (hasKnownSignupUser()) {
            ensureKnownUserSessionOnDashboard();
            return;
        }
        registerAndLogin(signupData);
        rememberSignedUpUser(signupData);
        openDashboardHome();
    }

    public void loginWithRegisteredCredentials() {
        LoginCredentials credentials = new LoginCredentials(currentThreadEmail(), currentThreadPassword());
        String currentUrl = BddWorld.authUiFlowService()
                .loginSuccessfully(BddWorld.config().baseUrl(), credentials);
        BddWorld.setCurrentUrl(currentUrl);
    }

    public String resolveExpectedPath(String pageLabel) {
        try {
            return BddWorld.uiActionExecutor().resolveTabPath(pageLabel);
        } catch (IllegalArgumentException exception) {
            return "/" + pageLabel.toLowerCase().replace(" ", "-");
        }
    }

    public void rememberSignedUpUser(SignupData signupData) {
        long threadId = Thread.currentThread().getId();
        THREAD_SIGNUP_EMAIL.put(threadId, signupData.email());
        THREAD_SIGNUP_PASSWORD.put(threadId, signupData.password());
        BddWorld.putSessionValue("signupEmail", signupData.email());
        BddWorld.putSessionValue("signupPassword", signupData.password());
        ApiCleanupHooks.trackSignupUser(signupData.email(), signupData.password());
    }

    private void ensureKnownUserSessionOnDashboard() {
        if (tryOpenDashboardFromCurrentSession()) {
            return;
        }
        loginWithRegisteredCredentials();
        openDashboardHome();
    }

    private boolean tryOpenDashboardFromCurrentSession() {
        try {
            openDashboardHome();
            return true;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private void openDashboardHome() {
        BddWorld.uiActionExecutor().navigateToTab("Home", BddWorld.config().baseUrl());
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    private void registerAndLogin(SignupData signupData) {
        BddWorld.authUiFlowService().registerSuccessfully(BddWorld.config().baseUrl(), signupData);
        BddWorld.authUiFlowService().loginSuccessfully(
                BddWorld.config().baseUrl(),
                new LoginCredentials(signupData.email(), signupData.password())
        );
    }

    private boolean hasKnownSignupUser() {
        return currentThreadEmail() != null && currentThreadPassword() != null;
    }

    private String currentThreadEmail() {
        return THREAD_SIGNUP_EMAIL.get(Thread.currentThread().getId());
    }

    private String currentThreadPassword() {
        return THREAD_SIGNUP_PASSWORD.get(Thread.currentThread().getId());
    }
}
