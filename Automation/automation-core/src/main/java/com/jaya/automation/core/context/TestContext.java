package com.jaya.automation.core.context;

import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.ui.UiEngine;

public final class TestContext {
    private final AutomationConfig automationConfig;
    private final ScenarioContext scenarioContext;
    private UiEngine uiEngine;

    public TestContext(AutomationConfig automationConfig) {
        this.automationConfig = automationConfig;
        this.scenarioContext = new ScenarioContext();
    }

    public AutomationConfig automationConfig() {
        return automationConfig;
    }

    public ScenarioContext scenarioContext() {
        return scenarioContext;
    }

    public UiEngine uiEngine() {
        return uiEngine;
    }

    public void setUiEngine(UiEngine uiEngine) {
        this.uiEngine = uiEngine;
    }
}
