package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class AdminLocators {

    private AdminLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
        return null;
    }

    public static LocatorSet action(String normalizedKey) {
        return switch (normalizedKey) {
            case "admin-user-edit" -> LocatorSet.of("admin-user-edit-action",
                    Locator.xpath("//button[normalize-space()='Edit']"));
            case "admin-user-delete" -> LocatorSet.of("admin-user-delete-action",
                    Locator.xpath("//button[normalize-space()='Delete']"));
            case "admin-confirm-delete" -> LocatorSet.of("admin-confirm-delete-action",
                    Locator.xpath("//button[normalize-space()='Confirm']"),
                    Locator.css("button[data-shortcut='modal-approve']"));
            default -> null;
        };
    }

    public static LocatorSet text(String normalizedKey) {
        return switch (normalizedKey) {
            case "admin-dashboard-title" -> LocatorSet.of("admin-dashboard-title-text",
                    Locator.xpath("//*[contains(normalize-space(),'System Analytics')]"),
                    Locator.xpath("//*[contains(normalize-space(),'Admin Dashboard')]"));
            default -> null;
        };
    }
}
