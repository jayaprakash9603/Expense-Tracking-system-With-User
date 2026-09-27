package com.jaya.automation.engine.playwright;

import com.jaya.automation.core.ui.KeyNames;
import com.jaya.automation.core.ui.Locator;
import com.jaya.automation.core.ui.UiElementActions;
import com.microsoft.playwright.Locator.ClickOptions;
import com.microsoft.playwright.Locator.DblclickOptions;
import com.microsoft.playwright.Locator.FillOptions;
import com.microsoft.playwright.options.SelectOption;
import com.microsoft.playwright.PlaywrightException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

final class PlaywrightElementActions implements UiElementActions {
    private static final Logger LOG = LoggerFactory.getLogger(PlaywrightElementActions.class);

    private final PlaywrightScope scope;
    private final PlaywrightLocatorResolver locatorResolver;
    private final PlaywrightWaitActions waitActions;
    private final double timeoutMs;

    PlaywrightElementActions(PlaywrightScope scope, PlaywrightLocatorResolver locatorResolver,
                             PlaywrightWaitActions waitActions, double timeoutMs) {
        this.scope = scope;
        this.locatorResolver = locatorResolver;
        this.waitActions = waitActions;
        this.timeoutMs = timeoutMs;
    }

    @Override
    public void click(Locator locator) {
        waitActions.forClickable(locator);
        resolve(locator).click(new ClickOptions().setTimeout(timeoutMs));
    }

    @Override
    public void clearAndType(Locator locator, String value) {
        waitActions.forVisible(locator);
        resolve(locator).fill(value, new FillOptions().setTimeout(timeoutMs));
    }

    @Override
    public String textOf(Locator locator) {
        waitActions.forVisible(locator);
        String text = resolve(locator).textContent();
        return text == null ? "" : text.trim();
    }

    @Override
    public boolean exists(Locator locator) {
        try {
            return resolve(locator).count() > 0;
        } catch (PlaywrightException ex) {
            LOG.debug("exists check failed for locator {}: {}", locator.value(), ex.getMessage());
            return false;
        }
    }

    @Override
    public boolean isVisible(Locator locator) {
        try {
            com.microsoft.playwright.Locator pwLocator = resolve(locator);
            return pwLocator.count() > 0 && pwLocator.isVisible();
        } catch (PlaywrightException ex) {
            LOG.debug("isVisible check failed for locator {}: {}", locator.value(), ex.getMessage());
            return false;
        }
    }

    @Override
    public void doubleClick(Locator locator) {
        waitActions.forClickable(locator);
        resolve(locator).dblclick(new DblclickOptions().setTimeout(timeoutMs));
    }

    @Override
    public void pressKey(Locator locator, String key) {
        waitActions.forVisible(locator);
        resolve(locator).press(KeyNames.playwrightName(key));
    }

    @Override
    public void selectNativeOption(Locator locator, String optionText) {
        waitActions.forVisible(locator);
        resolve(locator).selectOption(new SelectOption().setLabel(optionText));
    }

    @Override
    public void setChecked(Locator locator, boolean checked) {
        waitActions.forVisible(locator);
        com.microsoft.playwright.Locator element = resolve(locator);
        if (checked) {
            element.check();
        } else {
            element.uncheck();
        }
    }

    @Override
    public boolean isChecked(Locator locator) {
        waitActions.forVisible(locator);
        return resolve(locator).isChecked();
    }

    @Override
    public String attributeOf(Locator locator, String attribute) {
        waitActions.forVisible(locator);
        String value = resolve(locator).getAttribute(attribute);
        return value == null ? "" : value;
    }

    @Override
    public String tagNameOf(Locator locator) {
        waitActions.forVisible(locator);
        Object tagName = resolve(locator).evaluate("element => element.tagName.toLowerCase()");
        return tagName == null ? "" : String.valueOf(tagName);
    }

    private com.microsoft.playwright.Locator resolve(Locator locator) {
        return scope.locator(locatorResolver.resolve(locator));
    }
}
