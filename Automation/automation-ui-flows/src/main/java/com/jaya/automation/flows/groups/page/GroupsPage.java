package com.jaya.automation.flows.groups.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class GroupsPage extends BaseDomainPage {
    public GroupsPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("groups", "groups-title", "Groups"));
    }

    @Override
    public String path() {
        return "/groups";
    }
}
