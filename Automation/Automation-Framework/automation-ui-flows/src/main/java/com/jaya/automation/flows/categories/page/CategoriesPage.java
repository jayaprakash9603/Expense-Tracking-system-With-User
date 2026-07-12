package com.jaya.automation.flows.categories.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class CategoriesPage extends BaseDomainPage {
    public CategoriesPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("categories", "categories-title", "Categories"));
    }

    @Override
    public String path() {
        return "/category-flow";
    }
}
