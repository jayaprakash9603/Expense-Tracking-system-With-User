package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class SharedLocators {

    private SharedLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
        return switch (normalizedKey) {
            case "search-input" -> LocatorSet.of("search-input-field",
                    Locator.css("input[placeholder*='Search']"),
                    Locator.css("input[aria-label*='search']"),
                    Locator.css("input[type='search']"));
            default -> null;
        };
    }

    public static LocatorSet action(String normalizedKey) {
        return switch (normalizedKey) {
            case "modal-approve", "modal-confirm" -> LocatorSet.of("modal-approve-action",
                    Locator.css("button[data-shortcut='modal-approve']"),
                    Locator.xpath("//button[normalize-space()='Yes, Delete']"),
                    Locator.xpath("//button[normalize-space()='Confirm']"));
            case "modal-decline", "modal-cancel" -> LocatorSet.of("modal-decline-action",
                    Locator.css("button[data-shortcut='modal-decline']"),
                    Locator.css("button[aria-label='Close']"),
                    Locator.xpath("//button[normalize-space()='No, Cancel']"),
                    Locator.xpath("//button[normalize-space()='Cancel']"),
                    Locator.xpath("//button[normalize-space()='Close']"));
            case "modal-close" -> LocatorSet.of("modal-close-action",
                    Locator.xpath("//button[normalize-space()='Close']"),
                    Locator.css("button[aria-label='close']"),
                    Locator.css("button[aria-label='Close']"));
            default -> null;
        };
    }

    public static LocatorSet text(String normalizedKey) {
        return switch (normalizedKey) {
            case "toast-message" -> LocatorSet.of("toast-message-text",
                    Locator.css(".MuiSnackbarContent-message"),
                    Locator.css(".MuiSnackbar-root"),
                    Locator.css(".MuiAlert-message"));
            case "search-input" -> LocatorSet.of("search-input-text",
                    Locator.css("input[placeholder*='Search']"),
                    Locator.css("input[aria-label*='search']"),
                    Locator.css("input[type='search']"));
            case "modal-title" -> LocatorSet.of("modal-title-text",
                    Locator.css(".MuiDialogTitle-root"),
                    Locator.css("h2.MuiTypography-root"));
            default -> null;
        };
    }
}
