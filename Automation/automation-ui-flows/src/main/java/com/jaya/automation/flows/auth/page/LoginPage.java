package com.jaya.automation.flows.auth.page;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.core.ui.UiPage;
import com.jaya.automation.flows.auth.model.LoginCredentials;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.locator.LocatorSet;

public final class LoginPage implements UiPage {
    private static final LocatorSet EMAIL_FIELD = LocatorCatalog.input(
            "email",
            "login-email",
            "input[name='email']",
            "Email"
    );
    private static final LocatorSet PASSWORD_FIELD = LocatorCatalog.input(
            "password",
            "login-password",
            "input[name='password']",
            "Password"
    );
    private static final LocatorSet LOGIN_BUTTON = LocatorCatalog.button("login", "login-submit", "Login");
    private static final Locator ALERT_BANNER = Locator.css("[role='alert']");

    private final UiEngine uiEngine;

    public LoginPage(UiEngine uiEngine) {
        this.uiEngine = uiEngine;
    }

    @Override
    public String path() {
        return "/login";
    }

    public void open(String baseUrl) {
        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        uiEngine.navigateTo(normalizedBase + path());
    }

    public void submitCredentials(LoginCredentials credentials) {
        Locator emailLocator = EMAIL_FIELD.resolve(uiEngine);
        Locator passwordLocator = PASSWORD_FIELD.resolve(uiEngine);
        Locator loginButtonLocator = LOGIN_BUTTON.resolve(uiEngine);
        uiEngine.waits().forVisible(emailLocator);
        uiEngine.elements().clearAndType(emailLocator, credentials.username());
        uiEngine.elements().clearAndType(passwordLocator, credentials.password());
        uiEngine.elements().click(loginButtonLocator);
    }

    public String readErrorMessage() {
        uiEngine.waits().forVisible(ALERT_BANNER);
        return uiEngine.elements().textOf(ALERT_BANNER);
    }

    public boolean hasErrorBanner() {
        return uiEngine.elements().isVisible(ALERT_BANNER);
    }
}
