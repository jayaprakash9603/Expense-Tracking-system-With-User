package com.jaya.automation.engine.playwright;

import com.microsoft.playwright.FrameLocator;
import com.microsoft.playwright.Page;

final class PlaywrightScope {
    private final Page page;
    private FrameLocator activeFrame;

    PlaywrightScope(Page page) {
        this.page = page;
    }

    com.microsoft.playwright.Locator locator(String selector) {
        if (activeFrame == null) {
            return page.locator(selector).first();
        }
        return activeFrame.locator(selector).first();
    }

    void enterFrame(String selector) {
        activeFrame = page.frameLocator(selector);
    }

    void exitToRoot() {
        activeFrame = null;
    }
}
