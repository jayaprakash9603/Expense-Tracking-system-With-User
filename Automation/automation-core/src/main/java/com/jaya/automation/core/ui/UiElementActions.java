package com.jaya.automation.core.ui;

public interface UiElementActions {
    void click(Locator locator);

    void clearAndType(Locator locator, String value);

    String textOf(Locator locator);

    boolean exists(Locator locator);

    boolean isVisible(Locator locator);
}
