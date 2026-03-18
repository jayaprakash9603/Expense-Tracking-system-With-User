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
            case "bills", "bill" -> navigationFlowService.bills();
            case "categories", "category-flow" -> navigationFlowService.categories();
            case "payments", "payment-method" -> navigationFlowService.paymentMethods();
            case "friends" -> navigationFlowService.friends();
            case "groups" -> navigationFlowService.groups();
            case "sharing" -> navigationFlowService.sharing();
            case "chat" -> navigationFlowService.chat();
            case "settings" -> navigationFlowService.settings();
            case "profile" -> navigationFlowService.profile();
            case "admin" -> navigationFlowService.admin();
            default -> throw new IllegalArgumentException("Unsupported domain key: " + domainKey);
        };
    }

    public LocatorSet field(String fieldKey) {
        String normalizedKey = normalize(fieldKey);
        LocatorSet result = firstNonNull(
                expenseField(normalizedKey),
                billField(normalizedKey),
                categoryField(normalizedKey),
                paymentField(normalizedKey),
                budgetField(normalizedKey),
                authField(normalizedKey),
                profileField(normalizedKey),
                sharedField(normalizedKey)
        );
        return result != null ? result : genericField(normalizedKey);
    }

    public LocatorSet action(String actionKey) {
        String normalizedKey = normalize(actionKey);
        LocatorSet result = firstNonNull(
                expenseAction(normalizedKey),
                billAction(normalizedKey),
                categoryAction(normalizedKey),
                paymentAction(normalizedKey),
                budgetAction(normalizedKey),
                authAction(normalizedKey),
                profileAction(normalizedKey),
                adminAction(normalizedKey),
                sharedAction(normalizedKey)
        );
        return result != null ? result : genericAction(normalizedKey);
    }

    public LocatorSet text(String textKey) {
        String normalizedKey = normalize(textKey);
        LocatorSet result = firstNonNull(
                expenseText(normalizedKey),
                billText(normalizedKey),
                categoryText(normalizedKey),
                paymentText(normalizedKey),
                budgetText(normalizedKey),
                authText(normalizedKey),
                adminText(normalizedKey),
                sharedText(normalizedKey)
        );
        return result != null ? result : genericText(normalizedKey);
    }

    private static LocatorSet firstNonNull(LocatorSet... candidates) {
        for (LocatorSet candidate : candidates) {
            if (candidate != null) {
                return candidate;
            }
        }
        return null;
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
                    Locator.css("[role='combobox'][aria-label='Enter expense name']"),
                    Locator.css("input[aria-label='Enter expense name']"),
                    Locator.css("#expenseName"),
                    Locator.css("input[name='expenseName']")
            );
            case "expense-amount" -> LocatorSet.of(
                    "expense-amount-field",
                    Locator.css("[role='spinbutton'][aria-label='Amount *']"),
                    Locator.css("input[aria-label='Amount *']"),
                    Locator.css("#amount"),
                    Locator.css("input[name='amount']")
            );
            case "expense-comments" -> LocatorSet.of(
                    "expense-comments-field",
                    Locator.css("[role='textbox'][aria-label='Comments']"),
                    Locator.css("textarea[aria-label='Comments']"),
                    Locator.css("#comments"),
                    Locator.css("textarea[name='comments']")
            );
            case "expense-category" -> LocatorSet.of(
                    "expense-category-field",
                    Locator.css("[role='combobox'][aria-label='Select category']"),
                    Locator.css("input[aria-label='Select category']"),
                    Locator.css("#category"),
                    Locator.css("input[name='category']")
            );
            case "expense-payment-method" -> LocatorSet.of(
                    "expense-payment-method-field",
                    Locator.css("[role='combobox'][aria-label='Select payment method']"),
                    Locator.css("input[aria-label='Select payment method']"),
                    Locator.css("#paymentMethod"),
                    Locator.css("input[name='paymentMethod']")
            );
            case "expense-date" -> LocatorSet.of(
                    "expense-date-field",
                    Locator.xpath("//button[contains(@aria-label,'Choose date')]"),
                    Locator.css("button[aria-label*='Choose date']"),
                    Locator.css("input[aria-label*='Choose date']"),
                    Locator.css("#date")
            );
            case "expense-transaction-type" -> LocatorSet.of(
                    "expense-transaction-type-field",
                    Locator.css(".MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-fullWidth"),
                    Locator.css("[role='combobox'][aria-label='Select transaction type']"),
                    Locator.css("input[aria-label='Select transaction type']"),
                    Locator.css("#transactionType")
            );
            default -> null;
        };
    }

    private LocatorSet expenseAction(String normalizedKey) {
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

    private LocatorSet billField(String normalizedKey) {
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

    private LocatorSet billAction(String normalizedKey) {
        return switch (normalizedKey) {
            case "bill-create-new" -> LocatorSet.of("bill-create-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Create Bill')]"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Bill')]"),
                    Locator.xpath("//a[contains(@href,'/bill/create')]"));
            case "bill-submit" -> LocatorSet.of("bill-submit-action",
                    Locator.css("button[type='submit']"),
                    Locator.xpath("//button[normalize-space()='Create Bill']"),
                    Locator.xpath("//button[normalize-space()='Submit']"));
            case "bill-delete" -> LocatorSet.of("bill-delete-action",
                    Locator.xpath("//button[normalize-space()='Delete']"),
                    Locator.xpath("//button[normalize-space()='Delete Bill']"));
            case "bill-delete-confirm" -> LocatorSet.of("bill-delete-confirm-action",
                    Locator.css("button[data-shortcut='modal-approve']"),
                    Locator.xpath("//button[normalize-space()='Yes, Delete']"));
            case "bill-edit" -> LocatorSet.of("bill-edit-action",
                    Locator.xpath("//button[normalize-space()='Edit']"),
                    Locator.xpath("//button[normalize-space()='Edit Bill']"));
            default -> null;
        };
    }

    private LocatorSet billText(String normalizedKey) {
        return switch (normalizedKey) {
            case "bill-success-toast" -> LocatorSet.of("bill-success-toast-text",
                    Locator.xpath("//*[contains(normalize-space(),'Bill created successfully')]"),
                    Locator.xpath("//*[contains(normalize-space(),'Bill updated successfully')]"),
                    Locator.css(".MuiSnackbar-root"));
            case "bill-delete-toast" -> LocatorSet.of("bill-delete-toast-text",
                    Locator.xpath("//*[contains(normalize-space(),'Bill deleted successfully')]"));
            default -> null;
        };
    }

    private LocatorSet categoryField(String normalizedKey) {
        return switch (normalizedKey) {
            case "category-name" -> LocatorSet.of("category-name-field",
                    Locator.css("input[placeholder='Enter category name']"),
                    Locator.css("input[name='name']"),
                    Locator.css("input[aria-label*='category name']"));
            case "category-description" -> LocatorSet.of("category-description-field",
                    Locator.css("textarea[placeholder='Enter description']"),
                    Locator.css("textarea[name='description']"),
                    Locator.css("input[name='description']"));
            case "category-type" -> LocatorSet.of("category-type-field",
                    Locator.css("input[placeholder='Select type']"),
                    Locator.css("input[name='type']"));
            default -> null;
        };
    }

    private LocatorSet categoryAction(String normalizedKey) {
        return switch (normalizedKey) {
            case "category-create-new" -> LocatorSet.of("category-create-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Create Category')]"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Category')]"),
                    Locator.xpath("//a[contains(@href,'/category-flow/create')]"));
            case "category-submit" -> LocatorSet.of("category-submit-action",
                    Locator.css("button[type='submit']"),
                    Locator.xpath("//button[normalize-space()='Create Category']"),
                    Locator.xpath("//button[normalize-space()='Submit']"));
            case "category-delete" -> LocatorSet.of("category-delete-action",
                    Locator.xpath("//button[normalize-space()='Delete']"),
                    Locator.xpath("//button[normalize-space()='Delete Category']"));
            case "category-delete-confirm" -> LocatorSet.of("category-delete-confirm-action",
                    Locator.css("button[data-shortcut='modal-approve']"),
                    Locator.xpath("//button[normalize-space()='Yes, Delete']"));
            case "category-edit" -> LocatorSet.of("category-edit-action",
                    Locator.xpath("//button[normalize-space()='Edit']"),
                    Locator.xpath("//button[normalize-space()='Edit Category']"));
            default -> null;
        };
    }

    private LocatorSet categoryText(String normalizedKey) {
        return switch (normalizedKey) {
            case "category-success-toast" -> LocatorSet.of("category-success-toast-text",
                    Locator.xpath("//*[contains(normalize-space(),'Category created successfully')]"),
                    Locator.xpath("//*[contains(normalize-space(),'Category updated successfully')]"),
                    Locator.css(".MuiSnackbar-root"));
            case "category-delete-toast" -> LocatorSet.of("category-delete-toast-text",
                    Locator.xpath("//*[contains(normalize-space(),'Category deleted successfully')]"));
            default -> null;
        };
    }

    private LocatorSet paymentField(String normalizedKey) {
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

    private LocatorSet paymentAction(String normalizedKey) {
        return switch (normalizedKey) {
            case "payment-create-new" -> LocatorSet.of("payment-create-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Create Payment')]"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Payment')]"),
                    Locator.xpath("//a[contains(@href,'/payment-method/create')]"));
            case "payment-submit" -> LocatorSet.of("payment-submit-action",
                    Locator.css("button[type='submit']"),
                    Locator.xpath("//button[normalize-space()='Create Payment Method']"),
                    Locator.xpath("//button[normalize-space()='Submit']"));
            case "payment-delete" -> LocatorSet.of("payment-delete-action",
                    Locator.xpath("//button[normalize-space()='Delete']"),
                    Locator.xpath("//button[normalize-space()='Delete Payment Method']"));
            case "payment-delete-confirm" -> LocatorSet.of("payment-delete-confirm-action",
                    Locator.css("button[data-shortcut='modal-approve']"),
                    Locator.xpath("//button[normalize-space()='Yes, Delete']"));
            case "payment-edit" -> LocatorSet.of("payment-edit-action",
                    Locator.xpath("//button[normalize-space()='Edit']"),
                    Locator.xpath("//button[normalize-space()='Edit Payment Method']"));
            default -> null;
        };
    }

    private LocatorSet paymentText(String normalizedKey) {
        return switch (normalizedKey) {
            case "payment-success-toast" -> LocatorSet.of("payment-success-toast-text",
                    Locator.xpath("//*[contains(normalize-space(),'Payment method created successfully')]"),
                    Locator.xpath("//*[contains(normalize-space(),'Payment method updated successfully')]"),
                    Locator.css(".MuiSnackbar-root"));
            case "payment-delete-toast" -> LocatorSet.of("payment-delete-toast-text",
                    Locator.xpath("//*[contains(normalize-space(),'Payment method deleted successfully')]"));
            default -> null;
        };
    }

    private LocatorSet budgetField(String normalizedKey) {
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

    private LocatorSet budgetAction(String normalizedKey) {
        return switch (normalizedKey) {
            case "budget-create-new" -> LocatorSet.of("budget-create-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Create Budget')]"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Budget')]"),
                    Locator.xpath("//a[contains(@href,'/budget/create')]"));
            case "budget-submit" -> LocatorSet.of("budget-submit-action",
                    Locator.css("button[type='submit']"),
                    Locator.xpath("//button[normalize-space()='Submit']"),
                    Locator.xpath("//button[normalize-space()='Create Budget']"));
            case "budget-delete" -> LocatorSet.of("budget-delete-action",
                    Locator.xpath("//button[normalize-space()='Delete']"),
                    Locator.xpath("//button[normalize-space()='Delete Budget']"));
            case "budget-delete-confirm" -> LocatorSet.of("budget-delete-confirm-action",
                    Locator.css("button[data-shortcut='modal-approve']"),
                    Locator.xpath("//button[normalize-space()='Yes, Delete']"));
            case "budget-edit" -> LocatorSet.of("budget-edit-action",
                    Locator.xpath("//button[normalize-space()='Edit']"),
                    Locator.xpath("//button[normalize-space()='Edit Budget']"));
            default -> null;
        };
    }

    private LocatorSet budgetText(String normalizedKey) {
        return switch (normalizedKey) {
            case "budget-success-toast" -> LocatorSet.of("budget-success-toast-text",
                    Locator.xpath("//*[contains(normalize-space(),'Budget created successfully')]"),
                    Locator.xpath("//*[contains(normalize-space(),'Budget updated successfully')]"),
                    Locator.css(".MuiSnackbar-root"));
            case "budget-delete-toast" -> LocatorSet.of("budget-delete-toast-text",
                    Locator.xpath("//*[contains(normalize-space(),'Budget deleted successfully')]"));
            default -> null;
        };
    }

    private LocatorSet authField(String normalizedKey) {
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

    private LocatorSet authAction(String normalizedKey) {
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

    private LocatorSet authText(String normalizedKey) {
        return switch (normalizedKey) {
            case "auth-error" -> LocatorSet.of("auth-error-text",
                    Locator.css(".MuiAlert-message"),
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

    private LocatorSet profileField(String normalizedKey) {
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

    private LocatorSet profileAction(String normalizedKey) {
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

    private LocatorSet adminAction(String normalizedKey) {
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

    private LocatorSet adminText(String normalizedKey) {
        return switch (normalizedKey) {
            case "admin-dashboard-title" -> LocatorSet.of("admin-dashboard-title-text",
                    Locator.xpath("//*[contains(normalize-space(),'System Analytics')]"),
                    Locator.xpath("//*[contains(normalize-space(),'Admin Dashboard')]"));
            default -> null;
        };
    }

    private LocatorSet sharedField(String normalizedKey) {
        return switch (normalizedKey) {
            case "search-input" -> LocatorSet.of("search-input-field",
                    Locator.css("input[placeholder*='Search']"),
                    Locator.css("input[aria-label*='search']"),
                    Locator.css("input[type='search']"));
            default -> null;
        };
    }

    private LocatorSet sharedAction(String normalizedKey) {
        return switch (normalizedKey) {
            case "modal-approve", "modal-confirm" -> LocatorSet.of("modal-approve-action",
                    Locator.css("button[data-shortcut='modal-approve']"),
                    Locator.xpath("//button[normalize-space()='Yes, Delete']"),
                    Locator.xpath("//button[normalize-space()='Confirm']"));
            case "modal-decline", "modal-cancel" -> LocatorSet.of("modal-decline-action",
                    Locator.css("button[data-shortcut='modal-decline']"),
                    Locator.xpath("//button[normalize-space()='No, Cancel']"),
                    Locator.xpath("//button[normalize-space()='Cancel']"));
            case "modal-close" -> LocatorSet.of("modal-close-action",
                    Locator.xpath("//button[normalize-space()='Close']"),
                    Locator.css("button[aria-label='close']"),
                    Locator.css("button[aria-label='Close']"));
            default -> null;
        };
    }

    private LocatorSet sharedText(String normalizedKey) {
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
