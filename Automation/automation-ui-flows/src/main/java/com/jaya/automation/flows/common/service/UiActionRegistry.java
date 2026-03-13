package com.jaya.automation.flows.common.service;

import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.flows.common.locator.LocatorSet;
import com.jaya.automation.flows.common.page.BaseDomainPage;

import java.util.Locale;

public final class UiActionRegistry {
    public BaseDomainPage domainPage(String domainKey, DomainNavigationFlowService navigationFlowService) {
        return switch (normalize(domainKey)) {
            case "dashboard" -> navigationFlowService.dashboard();
            case "expenses" -> navigationFlowService.expenses();
            case "budgets" -> navigationFlowService.budgets();
            case "friends" -> navigationFlowService.friends();
            case "groups" -> navigationFlowService.groups();
            case "sharing" -> navigationFlowService.sharing();
            case "chat" -> navigationFlowService.chat();
            case "settings" -> navigationFlowService.settings();
            case "admin" -> navigationFlowService.admin();
            default -> throw new IllegalArgumentException("Unsupported domain key: " + domainKey);
        };
    }

    public LocatorSet field(String fieldKey) {
        String normalizedKey = normalize(fieldKey);
        LocatorSet expenseField = expenseField(normalizedKey);
        if (expenseField != null) {
            return expenseField;
        }
        return genericField(normalizedKey);
    }

    public LocatorSet action(String actionKey) {
        String normalizedKey = normalize(actionKey);
        LocatorSet expenseAction = expenseAction(normalizedKey);
        if (expenseAction != null) {
            return expenseAction;
        }
        return genericAction(normalizedKey);
    }

    public LocatorSet text(String textKey) {
        String normalizedKey = normalize(textKey);
        LocatorSet expenseText = expenseText(normalizedKey);
        if (expenseText != null) {
            return expenseText;
        }
        return genericText(normalizedKey);
    }

    private LocatorSet genericField(String normalizedKey) {
        String title = titleCase(normalizedKey);
        return LocatorSet.of(
                "field-" + normalizedKey,
                Locator.css("[data-testid='" + normalizedKey + "']"),
                Locator.css("[data-testid='input-" + normalizedKey + "']"),
                Locator.css("[data-testid='form-" + normalizedKey + "']"),
                Locator.css("input[name='" + normalizedKey + "']"),
                Locator.css("textarea[name='" + normalizedKey + "']"),
                Locator.css("input[placeholder='" + title + "']"),
                Locator.css("textarea[placeholder='" + title + "']")
        );
    }

    private LocatorSet genericAction(String normalizedKey) {
        String title = titleCase(normalizedKey);
        return LocatorSet.of(
                "action-" + normalizedKey,
                Locator.css("[data-testid='" + normalizedKey + "']"),
                Locator.css("[data-testid='btn-" + normalizedKey + "']"),
                Locator.css("[data-testid='button-" + normalizedKey + "']"),
                Locator.xpath("//button[normalize-space()='" + title + "']"),
                Locator.text(title)
        );
    }

    private LocatorSet genericText(String normalizedKey) {
        String title = titleCase(normalizedKey);
        return LocatorSet.of(
                "text-" + normalizedKey,
                Locator.css("[data-testid='" + normalizedKey + "']"),
                Locator.css("[data-testid='text-" + normalizedKey + "']"),
                Locator.xpath("//*[normalize-space()='" + title + "']"),
                Locator.text(title)
        );
    }

    private LocatorSet expenseField(String normalizedKey) {
        return switch (normalizedKey) {
            case "expense-name" -> LocatorSet.of(
                    "expense-name-field",
                    Locator.css("input[aria-label='Enter expense name']"),
                    Locator.css("#expenseName"),
                    Locator.css("input[name='expenseName']"),
                    Locator.css("input[placeholder='Enter expense name']")
            );
            case "expense-amount" -> LocatorSet.of(
                    "expense-amount-field",
                    Locator.css("input[aria-label='Amount *']"),
                    Locator.css("#amount"),
                    Locator.css("input[name='amount']")
            );
            case "expense-comments" -> LocatorSet.of(
                    "expense-comments-field",
                    Locator.css("textarea[aria-label='Comments']"),
                    Locator.css("#comments"),
                    Locator.css("textarea[name='comments']")
            );
            case "expense-category" -> LocatorSet.of(
                    "expense-category-field",
                    Locator.css("input[aria-label='Select category']"),
                    Locator.css("#category"),
                    Locator.css("input[name='category']"),
                    Locator.css("input[placeholder='Select category']")
            );
            case "expense-payment-method" -> LocatorSet.of(
                    "expense-payment-method-field",
                    Locator.css("input[aria-label='Select payment method']"),
                    Locator.css("#paymentMethod"),
                    Locator.css("input[name='paymentMethod']"),
                    Locator.css("input[placeholder='Select payment method']")
            );
            case "expense-date" -> LocatorSet.of(
                    "expense-date-field",
                    Locator.css("input[aria-label*='Choose date']"),
                    Locator.css("#date"),
                    Locator.css("input[name='date']")
            );
            default -> null;
        };
    }

    private LocatorSet expenseAction(String normalizedKey) {
        return switch (normalizedKey) {
            case "expense-add-new" -> LocatorSet.of(
                    "expense-add-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Add New')]"),
                    Locator.css("button[aria-label='Add new expense']"),
                    Locator.xpath("//button[contains(normalize-space(),'New Expense')]"),
                    Locator.xpath("//button[contains(normalize-space(),'Add')]")
            );
            case "expense-open-add" -> LocatorSet.of(
                    "expense-open-add-action",
                    Locator.xpath("//button[normalize-space()='Add Expense']"),
                    Locator.xpath("//li[normalize-space()='Add Expense']"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Expense')]")
            );
            case "expense-submit" -> LocatorSet.of(
                    "expense-submit-action",
                    Locator.css("button[type='submit']"),
                    Locator.xpath("//button[normalize-space()='Submit']"),
                    Locator.xpath("//button[normalize-space()='Add Expense']")
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

    private LocatorSet expenseText(String normalizedKey) {
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

    private String normalize(String key) {
        return key.trim()
                .toLowerCase(Locale.ROOT)
                .replace(" ", "-")
                .replace(".", "-")
                .replace("_", "-");
    }

    private String titleCase(String value) {
        if (value.isBlank()) {
            return value;
        }
        String[] tokens = value.replace("-", " ").split("\\s+");
        StringBuilder title = new StringBuilder();
        for (String token : tokens) {
            if (token.isBlank()) {
                continue;
            }
            if (title.length() > 0) {
                title.append(' ');
            }
            title.append(Character.toUpperCase(token.charAt(0)));
            if (token.length() > 1) {
                title.append(token.substring(1));
            }
        }
        return title.toString();
    }
}
