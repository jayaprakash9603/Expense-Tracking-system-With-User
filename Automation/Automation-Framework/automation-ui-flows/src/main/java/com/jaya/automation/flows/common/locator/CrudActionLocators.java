package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class CrudActionLocators {

    private CrudActionLocators() {
    }

    public static LocatorSet submit(String actionId, String primaryButtonLabel) {
        return LocatorSet.of(
                actionId,
                Locator.css("button[type='submit']"),
                Locator.xpath("//button[normalize-space()='" + primaryButtonLabel + "']"),
                Locator.xpath("//button[normalize-space()='Submit']")
        );
    }

    public static LocatorSet delete(String actionId, String entityLabel) {
        return LocatorSet.of(
                actionId,
                Locator.xpath("//button[normalize-space()='Delete']"),
                Locator.xpath("//button[normalize-space()='Delete " + entityLabel + "']")
        );
    }

    public static LocatorSet edit(String actionId, String entityLabel) {
        return LocatorSet.of(
                actionId,
                Locator.xpath("//button[normalize-space()='Edit']"),
                Locator.xpath("//button[normalize-space()='Edit " + entityLabel + "']")
        );
    }

    public static LocatorSet deleteConfirm(String actionId) {
        return LocatorSet.of(
                actionId,
                Locator.css("button[data-shortcut='modal-approve']"),
                Locator.xpath("//button[normalize-space()='Yes, Delete']")
        );
    }

    public static LocatorSet successToast(String textId, String createdMessage, String updatedMessage) {
        return LocatorSet.of(
                textId,
                Locator.xpath("//*[contains(normalize-space(),'" + createdMessage + "')]"),
                Locator.xpath("//*[contains(normalize-space(),'" + updatedMessage + "')]"),
                Locator.css(".MuiSnackbar-root")
        );
    }

    public static LocatorSet deletedToast(String textId, String deletedMessage) {
        return LocatorSet.of(
                textId,
                Locator.xpath("//*[contains(normalize-space(),'" + deletedMessage + "')]")
        );
    }
}
