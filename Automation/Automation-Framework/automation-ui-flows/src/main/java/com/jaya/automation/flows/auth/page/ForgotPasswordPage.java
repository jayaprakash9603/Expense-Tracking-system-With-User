package com.jaya.automation.flows.auth.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.locator.LocatorSet;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class ForgotPasswordPage extends BaseDomainPage {

    private final LocatorSet emailInput;
    private final LocatorSet sendOtpButton;
    private final LocatorSet newPasswordInput;
    private final LocatorSet confirmPasswordInput;
    private final LocatorSet resetButton;

    public ForgotPasswordPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("forgot-password", "forgot-password-title", "Forgot Password"));
        this.emailInput = LocatorCatalog.input("email", "email-input", "input[name='email']", "Enter your email");
        this.sendOtpButton = LocatorCatalog.button("send-otp", "send-otp-btn", "Send OTP");
        this.newPasswordInput = LocatorCatalog.input("new-password", "new-password-input", "input[name='newPassword']", "New Password");
        this.confirmPasswordInput = LocatorCatalog.input("confirm-password", "confirm-password-input", "input[name='confirmPassword']", "Confirm Password");
        this.resetButton = LocatorCatalog.button("reset-password", "reset-password-btn", "Reset Password");
    }

    @Override
    public String path() {
        return "/forgot-password";
    }

    public void enterEmail(String email) {
        uiEngine().elements().clearAndType(emailInput.resolve(uiEngine()), email);
    }

    public void clickSendOtp() {
        uiEngine().elements().click(sendOtpButton.resolve(uiEngine()));
    }

    public void enterNewPassword(String password) {
        uiEngine().elements().clearAndType(newPasswordInput.resolve(uiEngine()), password);
    }

    public void enterConfirmPassword(String password) {
        uiEngine().elements().clearAndType(confirmPasswordInput.resolve(uiEngine()), password);
    }

    public void clickResetPassword() {
        uiEngine().elements().click(resetButton.resolve(uiEngine()));
    }
}
