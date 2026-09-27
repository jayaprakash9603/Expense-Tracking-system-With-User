package com.jaya.automation.flows.common.service;

import com.jaya.automation.flows.common.locator.AdminLocators;
import com.jaya.automation.flows.common.locator.AuthLocators;
import com.jaya.automation.flows.common.locator.BillLocators;
import com.jaya.automation.flows.common.locator.BudgetLocators;
import com.jaya.automation.flows.common.locator.CategoryLocators;
import com.jaya.automation.flows.common.locator.DomainPageResolver;
import com.jaya.automation.flows.common.locator.ExpenseLocators;
import com.jaya.automation.flows.common.locator.GenericLocators;
import com.jaya.automation.flows.common.locator.LocatorRegistrySupport;
import com.jaya.automation.flows.common.locator.LocatorSet;
import com.jaya.automation.flows.common.locator.PaymentLocators;
import com.jaya.automation.flows.common.locator.ProfileLocators;
import com.jaya.automation.flows.common.locator.SharedLocators;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class UiActionRegistry {

    public BaseDomainPage domainPage(String domainKey, DomainNavigationFlowService navigationFlowService) {
        return DomainPageResolver.resolve(domainKey, navigationFlowService);
    }

    public LocatorSet field(String fieldKey) {
        String normalizedKey = LocatorRegistrySupport.normalize(fieldKey);
        LocatorSet result = LocatorRegistrySupport.firstNonNull(
                ExpenseLocators.field(normalizedKey),
                BillLocators.field(normalizedKey),
                CategoryLocators.field(normalizedKey),
                PaymentLocators.field(normalizedKey),
                BudgetLocators.field(normalizedKey),
                AuthLocators.field(normalizedKey),
                ProfileLocators.field(normalizedKey),
                SharedLocators.field(normalizedKey)
        );
        return result != null ? result : GenericLocators.field(normalizedKey);
    }

    public LocatorSet action(String actionKey) {
        String normalizedKey = LocatorRegistrySupport.normalize(actionKey);
        LocatorSet result = LocatorRegistrySupport.firstNonNull(
                ExpenseLocators.action(normalizedKey),
                BillLocators.action(normalizedKey),
                CategoryLocators.action(normalizedKey),
                PaymentLocators.action(normalizedKey),
                BudgetLocators.action(normalizedKey),
                AuthLocators.action(normalizedKey),
                ProfileLocators.action(normalizedKey),
                AdminLocators.action(normalizedKey),
                SharedLocators.action(normalizedKey)
        );
        return result != null ? result : GenericLocators.action(normalizedKey);
    }

    public LocatorSet text(String textKey) {
        String normalizedKey = LocatorRegistrySupport.normalize(textKey);
        LocatorSet result = LocatorRegistrySupport.firstNonNull(
                ExpenseLocators.text(normalizedKey),
                BillLocators.text(normalizedKey),
                CategoryLocators.text(normalizedKey),
                PaymentLocators.text(normalizedKey),
                BudgetLocators.text(normalizedKey),
                AuthLocators.text(normalizedKey),
                AdminLocators.text(normalizedKey),
                SharedLocators.text(normalizedKey)
        );
        return result != null ? result : GenericLocators.text(normalizedKey);
    }
}
