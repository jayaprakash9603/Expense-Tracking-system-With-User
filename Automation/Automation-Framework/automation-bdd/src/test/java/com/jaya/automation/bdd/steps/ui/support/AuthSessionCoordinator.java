package com.jaya.automation.bdd.steps.ui.support;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.hooks.ApiCleanupHooks;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import com.jaya.automation.flows.auth.model.LoginCredentials;
import com.jaya.automation.flows.auth.model.SignupData;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class AuthSessionCoordinator {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(AuthSessionCoordinator.class);
    private static final Map<Long, String> THREAD_SIGNUP_EMAIL = new ConcurrentHashMap<>();
    private static final Map<Long, String> THREAD_SIGNUP_PASSWORD = new ConcurrentHashMap<>();
    private static final String DASHBOARD_PATH = "/dashboard";
    private static final String LOGIN_PATH = "/login";
    private static final String REGISTER_PATH = "/register";

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
        if (isAlreadyOnAuthenticatedPage()) {
            LOG.info("Browser session is still active — reusing existing session for user: {}", currentThreadEmail());
            navigateToDashboardDirectly();
            return;
        }
        if (isOnAuthPage()) {
            LOG.info("Session expired — re-logging in with saved credentials for user: {}", currentThreadEmail());
            loginWithRegisteredCredentials();
            openDashboardHome();
            return;
        }
        if (tryNavigateToDashboard()) {
            return;
        }
        LOG.info("Dashboard navigation failed — falling back to re-login for user: {}", currentThreadEmail());
        loginWithRegisteredCredentials();
        openDashboardHome();
    }

    private boolean isAlreadyOnAuthenticatedPage() {
        String currentUrl = safeCurrentUrl();
        if (currentUrl.isBlank()) {
            return false;
        }
        return currentUrl.contains(DASHBOARD_PATH)
                || (!currentUrl.contains(LOGIN_PATH) && !currentUrl.contains(REGISTER_PATH) && containsAppRoute(currentUrl));
    }

    private boolean isOnAuthPage() {
        String currentUrl = safeCurrentUrl();
        return currentUrl.contains(LOGIN_PATH) || currentUrl.contains(REGISTER_PATH);
    }

    private boolean containsAppRoute(String url) {
        return url.contains("/expenses") || url.contains("/budget") || url.contains("/bill")
                || url.contains("/friends") || url.contains("/groups") || url.contains("/profile")
                || url.contains("/category") || url.contains("/payment") || url.contains("/chats")
                || url.contains("/reports") || url.contains("/admin");
    }

    private boolean tryNavigateToDashboard() {
        try {
            navigateToDashboardDirectly();
            String postNavUrl = safeCurrentUrl();
            if (postNavUrl.contains(LOGIN_PATH) || postNavUrl.contains(REGISTER_PATH)) {
                return false;
            }
            return true;
        } catch (RuntimeException exception) {
            LOG.debug("Dashboard navigation attempt threw: {}", exception.getMessage());
            return false;
        }
    }

    private void navigateToDashboardDirectly() {
        String baseUrl = BddWorld.config().baseUrl();
        String normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        BddWorld.testContext().uiEngine().navigateTo(normalizedBaseUrl + DASHBOARD_PATH);
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
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

    private String safeCurrentUrl() {
        try {
            return BddWorld.uiActionExecutor().currentUrl();
        } catch (RuntimeException exception) {
            return "";
        }
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
