package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.context.UiEngineFactory;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.context.TestContext;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import com.jaya.automation.core.ui.UiEngine;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;

/**
 * Explicit browser lifecycle step definitions following the company
 * test-automation pattern for browser setup and teardown per scenario ID.
 * <p>
 * Provides additional capabilities beyond {@link ScenarioIdUiSteps}:
 * <ul>
 *   <li>Headless/headed mode control at step level</li>
 *   <li>ID-based browser engine instance management via {@link AbstractStepDefinition}</li>
 *   <li>Explicit close/cleanup steps for multi-browser scenarios</li>
 * </ul>
 */
public class BrowserSetupSteps extends StepDataSupport {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(BrowserSetupSteps.class);

    @Given("a browser is launched for scenario {string}")
    public void launchBrowserForScenario(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);

        AutomationConfig config = BddWorld.config();
        UiEngine engine = UiEngineFactory.create(config);

        TestContext context = getTestContext(scenarioId);
        if (context == null) {
            context = new TestContext(config);
            setTestContext(scenarioId, context);
        }
        context.setUiEngine(engine);

        BddWorld.testContext().setUiEngine(engine);
        BddWorld.putScopedValue(scenarioId, "browser.ready", Boolean.TRUE);
        LOG.info("Browser launched for scenario '{}' using engine: {}", scenarioId, config.automationEngine());
    }

    @Given("a browser is launched in {string} mode for scenario {string}")
    public void launchBrowserInMode(String mode, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);

        AutomationConfig config = BddWorld.config();
        boolean headless = "headless".equalsIgnoreCase(mode);
        AutomationConfig overridden = config.withHeadless(headless);

        UiEngine engine = UiEngineFactory.create(overridden);

        TestContext context = getTestContext(scenarioId);
        if (context == null) {
            context = new TestContext(overridden);
            setTestContext(scenarioId, context);
        }
        context.setUiEngine(engine);

        BddWorld.testContext().setUiEngine(engine);
        BddWorld.putScopedValue(scenarioId, "browser.ready", Boolean.TRUE);
        BddWorld.putScopedValue(scenarioId, "browser.mode", mode);
        LOG.info("Browser launched in '{}' mode for scenario '{}'", mode, scenarioId);
    }

    @Given("a browser is launched and navigated to base URL for scenario {string}")
    public void launchBrowserAndNavigate(String scenarioId) {
        launchBrowserForScenario(scenarioId);

        AutomationConfig config = BddWorld.config();
        UiEngine engine = getUiEngine(scenarioId);
        engine.navigateTo(config.baseUrl());
        BddWorld.setCurrentUrl(config.baseUrl());
        BddWorld.putScopedValue(scenarioId, "page.url", config.baseUrl());
        LOG.info("Browser navigated to base URL for scenario '{}'", scenarioId);
    }

    @Then("the browser is closed for scenario {string}")
    public void closeBrowserForScenario(String scenarioId) {
        TestContext context = getTestContext(scenarioId);
        if (context != null && context.uiEngine() != null) {
            try {
                context.uiEngine().stop();
                LOG.info("Browser closed for scenario '{}'", scenarioId);
            } catch (Exception e) {
                LOG.warn("Error closing browser for scenario '{}': {}", scenarioId, e.getMessage());
            }
            context.setUiEngine(null);
        }
        BddWorld.putScopedValue(scenarioId, "browser.ready", Boolean.FALSE);
    }

    @Then("all browsers are closed")
    public void closeAllBrowsers() {
        getTestContextMap().forEach((id, context) -> {
            if (context.uiEngine() != null) {
                try {
                    context.uiEngine().stop();
                    LOG.info("Browser closed for scenario '{}'", id);
                } catch (Exception e) {
                    LOG.warn("Error closing browser for scenario '{}': {}", id, e.getMessage());
                }
                context.setUiEngine(null);
            }
        });
    }
}
