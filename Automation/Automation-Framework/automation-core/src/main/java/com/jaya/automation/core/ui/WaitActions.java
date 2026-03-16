package com.jaya.automation.core.ui;

public interface WaitActions {
    void forVisible(Locator locator);

    void forClickable(Locator locator);

    void forUrlContains(String expectedSegment);
}
