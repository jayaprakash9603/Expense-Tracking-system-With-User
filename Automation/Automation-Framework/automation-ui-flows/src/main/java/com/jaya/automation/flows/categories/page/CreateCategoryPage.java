package com.jaya.automation.flows.categories.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class CreateCategoryPage extends BaseDomainPage {
    public CreateCategoryPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("create-category", "create-category-title", "Create Category"));
    }

    @Override
    public String path() {
        return "/category-flow/create";
    }
}
