package com.jaya.automation.flows.payments.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class CreatePaymentMethodPage extends BaseDomainPage {
    public CreatePaymentMethodPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("create-payment", "create-payment-title", "Add Payment Method"));
    }

    @Override
    public String path() {
        return "/payment-method/create";
    }
}
