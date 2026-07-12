package com.jaya.automation.flows.chat.page;

import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.flows.common.locator.LocatorCatalog;
import com.jaya.automation.flows.common.page.BaseDomainPage;

public final class ChatPage extends BaseDomainPage {
    public ChatPage(UiEngine uiEngine) {
        super(uiEngine, LocatorCatalog.button("chat", "chat-title", "Chat"));
    }

    @Override
    public String path() {
        return "/chat";
    }
}
