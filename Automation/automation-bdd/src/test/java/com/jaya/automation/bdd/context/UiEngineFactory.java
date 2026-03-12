package com.jaya.automation.bdd.context;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.ui.UiEngine;
import com.jaya.automation.engine.playwright.PlaywrightUiEngine;
import com.jaya.automation.engine.selenium.SeleniumUiEngine;

public final class UiEngineFactory {
    private UiEngineFactory() {
    }

    public static UiEngine create(AutomationConfig config) {
        return switch (config.automationEngine()) {
            case SELENIUM -> new SeleniumUiEngine(config);
            case PLAYWRIGHT -> new PlaywrightUiEngine(config);
        };
    }
}
