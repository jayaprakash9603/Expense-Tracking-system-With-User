package com.jaya.automation.core.ui;

public interface WaitActions {
    void forVisible(Locator locator);

    void forClickable(Locator locator);

    void forUrlContains(String expectedSegment);

    default boolean isVisibleSafe(Locator locator) {
        try {
            forVisible(locator);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    default boolean waitForPageReady(Locator locator, long timeoutMs) {
        try {
            forVisible(locator);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    default boolean waitForEnabled(Locator locator, long timeoutMs) {
        return waitForPageReady(locator, timeoutMs);
    }

    default void forNetworkIdle() {
    }
}
