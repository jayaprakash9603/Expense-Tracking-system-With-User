package com.jaya.automation.flows.profile.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class ProfilePage extends BaseDomainPage {
    public ProfilePage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("profile", "profile-title", "Profile"));
    }

    @Override
    public String path() {
        return "/profile";
    }
}
