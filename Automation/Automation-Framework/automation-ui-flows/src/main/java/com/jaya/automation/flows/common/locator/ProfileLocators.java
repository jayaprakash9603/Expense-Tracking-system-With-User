package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class ProfileLocators {

    private ProfileLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
        return switch (normalizedKey) {
            case "profile-username" -> LocatorSet.of("profile-username-field",
                    Locator.css("input[name='username']"));
            case "profile-first-name" -> LocatorSet.of("profile-first-name-field",
                    Locator.css("input[name='firstName']"));
            case "profile-last-name" -> LocatorSet.of("profile-last-name-field",
                    Locator.css("input[name='lastName']"));
            case "profile-email" -> LocatorSet.of("profile-email-field",
                    Locator.css("input[name='email']"));
            case "profile-phone" -> LocatorSet.of("profile-phone-field",
                    Locator.css("input[name='phoneNumber']"));
            case "profile-location" -> LocatorSet.of("profile-location-field",
                    Locator.css("input[name='location']"));
            case "profile-bio" -> LocatorSet.of("profile-bio-field",
                    Locator.css("textarea[name='bio']"),
                    Locator.css("input[name='bio']"));
            default -> null;
        };
    }

    public static LocatorSet action(String normalizedKey) {
        return switch (normalizedKey) {
            case "profile-save" -> LocatorSet.of("profile-save-action",
                    Locator.xpath("//button[normalize-space()='Save Changes']"),
                    Locator.css("button[type='submit']"));
            case "profile-change-password" -> LocatorSet.of("profile-change-password-action",
                    Locator.xpath("//button[normalize-space()='Change Password']"));
            case "profile-image-upload" -> LocatorSet.of("profile-image-upload-action",
                    Locator.css("#profile-image-upload"));
            default -> null;
        };
    }

    public static LocatorSet text(String normalizedKey) {
        return null;
    }
}
