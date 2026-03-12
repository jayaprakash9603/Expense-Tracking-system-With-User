package com.jaya.automation.flows.friends.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class FriendsPage extends BaseDomainPage {
    public FriendsPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("friends", "friends-title", "Friends"));
    }

    @Override
    public String path() {
        return "/friends";
    }
}
