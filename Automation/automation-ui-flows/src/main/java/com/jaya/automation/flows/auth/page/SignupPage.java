package com.jaya.automation.flows.auth.page;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.core.ui.UiPage;
import com.jaya.automation.flows.auth.model.SignupData;
import com.jaya.automation.flows.common.locator.LocatorSet;

public final class SignupPage implements UiPage {
    private static final LocatorSet FIRST_NAME_FIELD = LocatorSet.of(
            "signup-first-name",
            Locator.css("input[name='firstName']"),
            Locator.css("input[placeholder='First Name']")
    );
    private static final LocatorSet LAST_NAME_FIELD = LocatorSet.of(
            "signup-last-name",
            Locator.css("input[name='lastName']"),
            Locator.css("input[placeholder='Last Name']")
    );
    private static final LocatorSet EMAIL_FIELD = LocatorSet.of(
            "signup-email",
            Locator.css("input[name='email']"),
            Locator.css("input[placeholder='Email']")
    );
    private static final LocatorSet PASSWORD_FIELD = LocatorSet.of(
            "signup-password",
            Locator.css("input[name='password']"),
            Locator.css("input[placeholder='Password']")
    );
    private static final LocatorSet REGISTER_BUTTON = LocatorSet.of(
            "signup-submit",
            Locator.xpath("//button[normalize-space()='Register']"),
            Locator.css("button[type='submit']")
    );
    private static final Locator ALERT_BANNER = Locator.css("[role='alert']");

    private final UiEngine uiEngine;

    public SignupPage(UiEngine uiEngine) {
        this.uiEngine = uiEngine;
    }

    @Override
    public String path() {
        return "/register";
    }

    public void open(String baseUrl) {
        String normalizedBase = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        uiEngine.navigateTo(normalizedBase + path());
    }

    public void submitSignup(SignupData signupData) {
        clearAndType(FIRST_NAME_FIELD, signupData.firstName());
        clearAndType(LAST_NAME_FIELD, signupData.lastName());
        clearAndType(EMAIL_FIELD, signupData.email());
        clearAndType(PASSWORD_FIELD, signupData.password());
        Locator buttonLocator = REGISTER_BUTTON.resolve(uiEngine);
        uiEngine.waits().forClickable(buttonLocator);
        uiEngine.elements().click(buttonLocator);
    }

    public String readErrorMessage() {
        uiEngine.waits().forVisible(ALERT_BANNER);
        return uiEngine.elements().textOf(ALERT_BANNER);
    }

    private void clearAndType(LocatorSet locatorSet, String value) {
        Locator fieldLocator = locatorSet.resolve(uiEngine);
        uiEngine.waits().forVisible(fieldLocator);
        uiEngine.elements().clearAndType(fieldLocator, value);
    }
}
