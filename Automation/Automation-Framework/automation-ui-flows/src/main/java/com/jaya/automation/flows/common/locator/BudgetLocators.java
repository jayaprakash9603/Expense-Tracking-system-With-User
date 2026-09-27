package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class BudgetLocators {

    private BudgetLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
        return switch (normalizedKey) {
            case "budget-name" -> LocatorSet.of("budget-name-field",
                    Locator.css("input[placeholder='Enter budget name']"),
                    Locator.css("input[name='name']"),
                    Locator.css("input[aria-label*='Budget Name']"));
            case "budget-description" -> LocatorSet.of("budget-description-field",
                    Locator.css("textarea[placeholder='Add a description']"),
                    Locator.css("textarea[name='description']"),
                    Locator.css("input[name='description']"));
            case "budget-amount" -> LocatorSet.of("budget-amount-field",
                    Locator.css("input[placeholder='Enter total amount']"),
                    Locator.css("input[name='amount']"));
            case "budget-start-date" -> LocatorSet.of("budget-start-date-field",
                    Locator.css("input[name='startDate']"),
                    Locator.css("input[placeholder*='start date']"));
            case "budget-end-date" -> LocatorSet.of("budget-end-date-field",
                    Locator.css("input[name='endDate']"),
                    Locator.css("input[placeholder*='end date']"));
            default -> null;
        };
    }

    public static LocatorSet action(String normalizedKey) {
        return switch (normalizedKey) {
            case "budget-create-new" -> LocatorSet.of("budget-create-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Create Budget')]"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Budget')]"),
                    Locator.xpath("//a[contains(@href,'/budget/create')]"));
            case "budget-submit" -> CrudActionLocators.submit("budget-submit-action", "Create Budget");
            case "budget-delete" -> CrudActionLocators.delete("budget-delete-action", "Budget");
            case "budget-delete-confirm" -> CrudActionLocators.deleteConfirm("budget-delete-confirm-action");
            case "budget-edit" -> CrudActionLocators.edit("budget-edit-action", "Budget");
            default -> null;
        };
    }

    public static LocatorSet text(String normalizedKey) {
        return switch (normalizedKey) {
            case "budget-success-toast" -> CrudActionLocators.successToast(
                    "budget-success-toast-text",
                    "Budget created successfully",
                    "Budget updated successfully");
            case "budget-delete-toast" -> CrudActionLocators.deletedToast(
                    "budget-delete-toast-text",
                    "Budget deleted successfully");
            default -> null;
        };
    }
}
