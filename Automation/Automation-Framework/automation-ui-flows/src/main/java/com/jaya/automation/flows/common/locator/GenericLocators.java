package com.jaya.automation.flows.common.locator;

import com.jaya.automation.core.ui.Locator;

public final class GenericLocators {

    private GenericLocators() {
    }

    public static LocatorSet field(String normalizedKey) {
        String title = LocatorRegistrySupport.titleCase(normalizedKey);
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

    public static LocatorSet action(String normalizedKey) {
        String title = LocatorRegistrySupport.titleCase(normalizedKey);
        return LocatorSet.of(
                "action-" + normalizedKey,
                Locator.css("[data-testid='" + normalizedKey + "']"),
                Locator.css("[data-testid='btn-" + normalizedKey + "']"),
                Locator.css("[data-testid='button-" + normalizedKey + "']"),
                Locator.xpath("//button[normalize-space()='" + title + "']"),
                Locator.text(title)
        );
    }

    public static LocatorSet text(String normalizedKey) {
        String title = LocatorRegistrySupport.titleCase(normalizedKey);
        return LocatorSet.of(
                "text-" + normalizedKey,
                Locator.css("[data-testid='" + normalizedKey + "']"),
                Locator.css("[data-testid='text-" + normalizedKey + "']"),
                Locator.xpath("//*[normalize-space()='" + title + "']"),
                Locator.text(title)
        );
    }
}
