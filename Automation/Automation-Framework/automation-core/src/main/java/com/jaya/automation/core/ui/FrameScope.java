package com.jaya.automation.core.ui;

public interface FrameScope {
    void enter(Locator frameLocator);

    void exitToRoot();
}
