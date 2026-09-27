package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class PaymentLocators {

    private PaymentLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
        return switch (normalizedKey) {
            case "payment-name" -> LocatorSet.of("payment-name-field",
                    Locator.css("input[placeholder='Enter payment method name']"),
                    Locator.css("input[name='name']"),
                    Locator.css("input[aria-label*='payment method name']"));
            case "payment-description" -> LocatorSet.of("payment-description-field",
                    Locator.css("textarea[placeholder='Enter description']"),
                    Locator.css("textarea[name='description']"),
                    Locator.css("input[name='description']"));
            case "payment-amount" -> LocatorSet.of("payment-amount-field",
                    Locator.css("input[placeholder='Enter amount']"),
                    Locator.css("input[name='amount']"));
            case "payment-type" -> LocatorSet.of("payment-type-field",
                    Locator.css("input[placeholder='Select type']"),
                    Locator.css("input[name='type']"));
            default -> null;
        };
    }

    public static LocatorSet action(String normalizedKey) {
        return switch (normalizedKey) {
            case "payment-create-new" -> LocatorSet.of("payment-create-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Create Payment')]"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Payment')]"),
                    Locator.xpath("//a[contains(@href,'/payment-method/create')]"));
            case "payment-submit" -> CrudActionLocators.submit("payment-submit-action", "Create Payment Method");
            case "payment-delete" -> CrudActionLocators.delete("payment-delete-action", "Payment Method");
            case "payment-delete-confirm" -> CrudActionLocators.deleteConfirm("payment-delete-confirm-action");
            case "payment-edit" -> CrudActionLocators.edit("payment-edit-action", "Payment Method");
            default -> null;
        };
    }

    public static LocatorSet text(String normalizedKey) {
        return switch (normalizedKey) {
            case "payment-success-toast" -> CrudActionLocators.successToast(
                    "payment-success-toast-text",
                    "Payment method created successfully",
                    "Payment method updated successfully");
            case "payment-delete-toast" -> CrudActionLocators.deletedToast(
                    "payment-delete-toast-text",
                    "Payment method deleted successfully");
            default -> null;
        };
    }
}
