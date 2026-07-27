package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class CategoryLocators {

    private CategoryLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
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

    public static LocatorSet action(String normalizedKey) {
        return switch (normalizedKey) {
            case "category-create-new" -> LocatorSet.of("category-create-new-action",
                    Locator.xpath("//button[contains(normalize-space(),'Create Category')]"),
                    Locator.xpath("//button[contains(normalize-space(),'Add Category')]"),
                    Locator.xpath("//a[contains(@href,'/category-flow/create')]"));
            case "category-submit" -> CrudActionLocators.submit("category-submit-action", "Create Category");
            case "category-delete" -> CrudActionLocators.delete("category-delete-action", "Category");
            case "category-delete-confirm" -> CrudActionLocators.deleteConfirm("category-delete-confirm-action");
            case "category-edit" -> CrudActionLocators.edit("category-edit-action", "Category");
            default -> null;
        };
    }

    public static LocatorSet text(String normalizedKey) {
        return switch (normalizedKey) {
            case "category-success-toast" -> CrudActionLocators.successToast(
                    "category-success-toast-text",
                    "Category created successfully",
                    "Category updated successfully");
            case "category-delete-toast" -> CrudActionLocators.deletedToast(
                    "category-delete-toast-text",
                    "Category deleted successfully");
            default -> null;
        };
    }
}
