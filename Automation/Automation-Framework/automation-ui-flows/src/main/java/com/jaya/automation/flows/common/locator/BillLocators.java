package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class BillLocators {

    private BillLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
        return switch (normalizedKey) {
            case "bill-name" -> LocatorSet.of("bill-name-field",
                    Locator.css("input[name='name']"),
                    Locator.css("input[placeholder*='bill name']"),
                    Locator.css("input[aria-label*='Bill Name']"));
            case "bill-description" -> LocatorSet.of("bill-description-field",
                    Locator.css("textarea[name='description']"),
                    Locator.css("input[name='description']"),
                    Locator.css("textarea[placeholder*='description']"));
            case "bill-amount" -> LocatorSet.of("bill-amount-field",
                    Locator.css("input[name='amount']"),
                    Locator.css("#amount"));
            case "bill-date" -> LocatorSet.of("bill-date-field",
                    Locator.css("input[name='date']"),
                    Locator.css("input[aria-label*='Choose date']"));
            case "bill-category" -> LocatorSet.of("bill-category-field",
                    Locator.css("input[name='categoryId']"),
                    Locator.css("input[placeholder*='category']"));
            case "bill-payment-method" -> LocatorSet.of("bill-payment-method-field",
                    Locator.css("input[name='paymentMethod']"),
                    Locator.css("input[placeholder*='payment method']"));
            case "bill-type" -> LocatorSet.of("bill-type-field",
                    Locator.css("input[name='type']"),
                    Locator.css("input[placeholder*='type']"));
            default -> null;
        };
    }

    public static LocatorSet action(String normalizedKey) {
        return switch (normalizedKey) {
            case "bill-create-new" -> LocatorSet.of("bill-create-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Create Bill')]"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Bill')]"),
                    Locator.xpath("//a[contains(@href,'/bill/create')]"));
            case "bill-submit" -> CrudActionLocators.submit("bill-submit-action", "Create Bill");
            case "bill-delete" -> CrudActionLocators.delete("bill-delete-action", "Bill");
            case "bill-delete-confirm" -> CrudActionLocators.deleteConfirm("bill-delete-confirm-action");
            case "bill-edit" -> CrudActionLocators.edit("bill-edit-action", "Bill");
            default -> null;
        };
    }

    public static LocatorSet text(String normalizedKey) {
        return switch (normalizedKey) {
            case "bill-success-toast" -> CrudActionLocators.successToast(
                    "bill-success-toast-text",
                    "Bill created successfully",
                    "Bill updated successfully");
            case "bill-delete-toast" -> CrudActionLocators.deletedToast(
                    "bill-delete-toast-text",
                    "Bill deleted successfully");
            default -> null;
        };
    }
}
