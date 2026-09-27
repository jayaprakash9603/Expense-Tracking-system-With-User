package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class ExpenseLocators {

    private ExpenseLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
        return switch (normalizedKey) {
            case "expense-name" -> LocatorSet.of(
                    "expense-name-field",
                    Locator.css("input[placeholder='Enter expense name']"),
                    Locator.css("[role='combobox'][placeholder='Enter expense name']"),
                    Locator.css("#expenseName"),
                    Locator.css("input[name='expenseName']")
            );
            case "expense-amount" -> LocatorSet.of(
                    "expense-amount-field",
                    Locator.css("input#amount"),
                    Locator.css("input[name='amount']"),
                    Locator.css("input[placeholder='Enter amount']"),
                    Locator.css("input[type='number'][name='amount']")
            );
            case "expense-comments" -> LocatorSet.of(
                    "expense-comments-field",
                    Locator.css("textarea#comments"),
                    Locator.css("textarea[name='comments']"),
                    Locator.css("textarea[placeholder='Add a comment']"),
                    Locator.css("#comments")
            );
            case "expense-category" -> LocatorSet.of(
                    "expense-category-field",
                    Locator.css("input[placeholder='Select category']"),
                    Locator.css("[role='combobox'][placeholder='Select category']"),
                    Locator.css("#category"),
                    Locator.css("input[name='category']")
            );
            case "expense-payment-method" -> LocatorSet.of(
                    "expense-payment-method-field",
                    Locator.css("input[placeholder='Select payment method']"),
                    Locator.css("[role='combobox'][placeholder='Select payment method']"),
                    Locator.css("#paymentMethod"),
                    Locator.css("input[name='paymentMethod']")
            );
            case "expense-date" -> LocatorSet.of(
                    "expense-date-field",
                    Locator.css("input[placeholder='Choose a date']"),
                    Locator.xpath("//button[contains(@aria-label,'Choose date')]"),
                    Locator.css("button[aria-label*='Choose date']"),
                    Locator.css("#date")
            );
            case "expense-transaction-type" -> LocatorSet.of(
                    "expense-transaction-type-field",
                    Locator.css("input[placeholder='Select transaction type']"),
                    Locator.css("[role='combobox'][placeholder='Select transaction type']"),
                    Locator.css("#transactionType"),
                    Locator.css("input[name='transactionType']")
            );
            default -> null;
        };
    }

    public static LocatorSet action(String normalizedKey) {
        return switch (normalizedKey) {
            case "expense-add-new" -> LocatorSet.of(
                    "expense-add-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Add New')]"),
                    Locator.css("button.fixed.rounded-full"),
                    Locator.xpath("//button[contains(@class,'fixed') and contains(@class,'rounded-full')]"),
                    Locator.css("button[aria-label='Add new expense']"),
                    Locator.css("[data-testid='add-new']")
            );
            case "expense-open-add" -> LocatorSet.of(
                    "expense-open-add-action",
                    Locator.xpath("//button[normalize-space()='Add Expense']"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Expense')]"),
                    Locator.xpath("//li[normalize-space()='Add Expense']"),
                    Locator.css("[data-testid='add-expense']")
            );
            case "expense-submit" -> LocatorSet.of(
                    "expense-submit-action",
                    Locator.xpath("//button[normalize-space()='Submit']"),
                    Locator.css("button[type='submit']"),
                    Locator.css("[data-testid='expense-submit']")
            );
            case "expense-edit" -> LocatorSet.of(
                    "expense-edit-action",
                    Locator.xpath("//button[normalize-space()='Edit Expense']"),
                    Locator.xpath("//button[normalize-space()='Edit']")
            );
            case "expense-delete" -> LocatorSet.of(
                    "expense-delete-action",
                    Locator.xpath("//button[normalize-space()='Delete Expense']"),
                    Locator.xpath("//button[normalize-space()='Delete']")
            );
            case "expense-delete-confirm" -> LocatorSet.of(
                    "expense-delete-confirm-action",
                    Locator.css("button[data-shortcut='modal-approve']"),
                    Locator.xpath("//button[normalize-space()='Yes, Delete']")
            );
            default -> null;
        };
    }

    public static LocatorSet text(String normalizedKey) {
        return switch (normalizedKey) {
            case "expense-page-anchor" -> LocatorSet.of(
                    "expense-page-anchor-text",
                    Locator.xpath("//button[contains(normalize-space(),'Money In & Out')]")
            );
            case "expense-delete-confirmation" -> LocatorSet.of(
                    "expense-delete-confirmation-text",
                    Locator.xpath("//*[normalize-space()='Deletion Confirmation']")
            );
            case "expense-toast-deleted" -> LocatorSet.of(
                    "expense-toast-deleted-text",
                    Locator.xpath("//*[contains(normalize-space(),'Expense deleted successfully')]")
            );
            default -> null;
        };
    }
}
