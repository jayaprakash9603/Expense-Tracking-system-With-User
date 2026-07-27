package com.jaya.automation.flows.common.locator;

import com.jaya.automation.flows.common.page.BaseDomainPage;
import com.jaya.automation.flows.common.service.DomainNavigationFlowService;

public final class DomainPageResolver {

    private DomainPageResolver() {
    }

    public static BaseDomainPage resolve(String domainKey, DomainNavigationFlowService navigationFlowService) {
        return switch (LocatorRegistrySupport.normalize(domainKey)) {
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
}
