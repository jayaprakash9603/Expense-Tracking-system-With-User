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

    public LocatorSet action(String actionKey) {
        String normalizedKey = normalize(actionKey);
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

    public LocatorSet text(String textKey) {
        String normalizedKey = normalize(textKey);
        String title = titleCase(normalizedKey);
        return LocatorSet.of(
                "text-" + normalizedKey,
                Locator.css("[data-testid='" + normalizedKey + "']"),
                Locator.css("[data-testid='text-" + normalizedKey + "']"),
                Locator.xpath("//*[normalize-space()='" + title + "']"),
                Locator.text(title)
        );
    }

    private String normalize(String key) {
        return key.trim()
                .toLowerCase(Locale.ROOT)
                .replace(" ", "-")
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
