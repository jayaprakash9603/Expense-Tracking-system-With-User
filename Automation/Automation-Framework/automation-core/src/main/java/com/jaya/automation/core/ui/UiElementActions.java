package com.jaya.automation.core.ui;

public interface UiElementActions {
    void click(Locator locator);

    void clearAndType(Locator locator, String value);

    String textOf(Locator locator);

    boolean exists(Locator locator);

    boolean isVisible(Locator locator);

    void doubleClick(Locator locator);

    void pressKey(Locator locator, String key);

    void selectNativeOption(Locator locator, String optionText);

    void setChecked(Locator locator, boolean checked);

    boolean isChecked(Locator locator);

    String attributeOf(Locator locator, String attribute);

    String tagNameOf(Locator locator);
}
