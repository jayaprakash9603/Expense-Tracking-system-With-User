package com.jaya.automation.flows.payments.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class PaymentMethodsPage extends BaseDomainPage {
    public PaymentMethodsPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("payment-methods", "payment-methods-title", "Payment Methods"));
    }

    @Override
    public String path() {
        return "/payment-method";
    }
}
