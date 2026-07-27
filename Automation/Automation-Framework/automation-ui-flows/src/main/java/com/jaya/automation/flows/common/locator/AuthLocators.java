package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class AuthLocators {

    private AuthLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
        return switch (normalizedKey) {
            case "login-email" -> LocatorSet.of("login-email-field",
                    Locator.css("input[name='email']"),
                    Locator.css("input[placeholder='Email']"));
            case "login-password" -> LocatorSet.of("login-password-field",
                    Locator.css("input[name='password']"),
                    Locator.css("input[placeholder='Password']"));
            case "register-first-name" -> LocatorSet.of("register-first-name-field",
                    Locator.css("input[name='firstName']"),
                    Locator.css("input[placeholder='First Name']"));
            case "register-last-name" -> LocatorSet.of("register-last-name-field",
                    Locator.css("input[name='lastName']"),
                    Locator.css("input[placeholder='Last Name']"));
            case "register-email" -> LocatorSet.of("register-email-field",
                    Locator.css("input[name='email']"),
                    Locator.css("input[placeholder='Email']"));
            case "register-password" -> LocatorSet.of("register-password-field",
                    Locator.css("input[name='password']"),
                    Locator.css("input[placeholder='Password']"));
            case "forgot-email" -> LocatorSet.of("forgot-email-field",
                    Locator.css("input[name='email']"),
                    Locator.css("input[placeholder='Enter your email']"));
            case "forgot-password" -> LocatorSet.of("forgot-password-field",
                    Locator.css("input[name='password']"),
                    Locator.css("input[placeholder='New Password']"));
            case "forgot-confirm-password" -> LocatorSet.of("forgot-confirm-password-field",
                    Locator.css("input[name='confirmPassword']"),
                    Locator.css("input[placeholder='Confirm Password']"));
            default -> null;
        };
    }

    public static LocatorSet action(String normalizedKey) {
        return switch (normalizedKey) {
            case "login-submit" -> LocatorSet.of("login-submit-action",
                    Locator.xpath("//button[normalize-space()='Login']"),
                    Locator.css("button[type='submit']"));
            case "register-submit" -> LocatorSet.of("register-submit-action",
                    Locator.xpath("//button[normalize-space()='Register']"),
                    Locator.css("button[type='submit']"));
            case "forgot-send-otp" -> LocatorSet.of("forgot-send-otp-action",
                    Locator.xpath("//button[normalize-space()='Send OTP']"),
                    Locator.css("button[type='submit']"));
            case "forgot-reset-password" -> LocatorSet.of("forgot-reset-password-action",
                    Locator.xpath("//button[normalize-space()='Reset Password']"),
                    Locator.xpath("//button[normalize-space()='Create Password']"));
            case "otp-verify" -> LocatorSet.of("otp-verify-action",
                    Locator.xpath("//button[normalize-space()='Verify']"));
            case "otp-resend" -> LocatorSet.of("otp-resend-action",
                    Locator.css("#resendButton"),
                    Locator.xpath("//button[normalize-space()='Resend Code']"));
            default -> null;
        };
    }

    public static LocatorSet text(String normalizedKey) {
        return switch (normalizedKey) {
            case "auth-error" -> LocatorSet.of("auth-error-text",
                    Locator.css(".MuiAlert-message"),
                    Locator.css(".Mui-error"),
                    Locator.css("[aria-invalid='true']"),
                    Locator.xpath("//*[contains(@class,'error')]"));
            case "auth-success" -> LocatorSet.of("auth-success-text",
                    Locator.css(".MuiAlert-message"),
                    Locator.xpath("//*[contains(@class,'success')]"));
            case "login-error" -> LocatorSet.of("login-error-text",
                    Locator.css(".MuiAlert-message"),
                    Locator.xpath("//*[contains(normalize-space(),'Invalid')]"));
            default -> null;
        };
    }
}
