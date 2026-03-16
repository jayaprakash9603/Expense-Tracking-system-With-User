package com.jaya.automation.flows.settings.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class SettingsPage extends BaseDomainPage {
    public SettingsPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("settings", "settings-title", "Settings"));
    }

    @Override
    public String path() {
        return "/settings";
    }
}
