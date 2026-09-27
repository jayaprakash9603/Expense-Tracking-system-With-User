package com.jaya.automation.bdd.steps.ui.generic;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import io.cucumber.java.en.When;

public class GenericNavigationSteps extends StepDataSupport {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(GenericNavigationSteps.class);

    @When("I navigate to URL {string} for scenario ID {string}")
    public void navigateToUrl(String url, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().navigateToUrl(resolveDynamic(url), BddWorld.config().baseUrl());
        BddWorld.setCurrentUrl(BddWorld.genericUiActions().currentUrl());
        LOG.info("Navigated to URL '{}' for scenario ID: {}", url, scenarioId);
    }

    @When("I navigate to URL {string} with page title {string} for scenario ID {string}")
    public void navigateToUrlWithTitle(String url, String expectedTitle, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().navigateToUrlWithTitle(
                resolveDynamic(url), resolveDynamic(expectedTitle), BddWorld.config().baseUrl());
        BddWorld.setCurrentUrl(BddWorld.genericUiActions().currentUrl());
        LOG.info("Navigated to URL '{}' with title '{}' for scenario ID: {}", url, expectedTitle, scenarioId);
    }

    @When("I reload page for scenario ID {string}")
    public void reloadPage(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().reloadPage();
        BddWorld.setCurrentUrl(BddWorld.genericUiActions().currentUrl());
        LOG.info("Reloaded page for scenario ID: {}", scenarioId);
    }

    @When("I navigate back for scenario ID {string}")
    public void navigateBack(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().navigateBack();
        BddWorld.setCurrentUrl(BddWorld.genericUiActions().currentUrl());
        LOG.info("Navigated back for scenario ID: {}", scenarioId);
    }

    @When("I navigate forward for scenario ID {string}")
    public void navigateForward(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().navigateForward();
        BddWorld.setCurrentUrl(BddWorld.genericUiActions().currentUrl());
        LOG.info("Navigated forward for scenario ID: {}", scenarioId);
    }

    @When("I wait for page to be fully loaded for scenario ID {string}")
    public void waitForPageFullyLoaded(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().waitForPageFullyLoaded();
        LOG.info("Page fully loaded for scenario ID: {}", scenarioId);
    }
}
