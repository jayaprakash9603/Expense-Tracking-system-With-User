package com.jaya.automation.bdd.steps.ui.generic;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import io.cucumber.java.en.When;

public class GenericInteractionSteps extends StepDataSupport {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(GenericInteractionSteps.class);

    @When("I click button {string} for scenario ID {string}")
    public void clickButton(String button, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().clickButton(resolveDynamic(button));
        LOG.info("Clicked button '{}' for scenario ID: {}", button, scenarioId);
    }

    @When("I click link {string} for scenario ID {string}")
    public void clickLink(String link, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().clickLink(resolveDynamic(link));
        LOG.info("Clicked link '{}' for scenario ID: {}", link, scenarioId);
    }

    @When("I click element with selector {string} for scenario ID {string}")
    public void clickElementWithSelector(String selector, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().clickSelector(resolveDynamic(selector));
        LOG.info("Clicked selector '{}' for scenario ID: {}", selector, scenarioId);
    }

    @When("I click element with selector {string} in frame {string} for scenario ID {string}")
    public void clickElementWithSelectorInFrame(String selector, String frame, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().clickSelectorInFrame(resolveDynamic(selector), resolveDynamic(frame));
        LOG.info("Clicked selector '{}' in frame '{}' for scenario ID: {}", selector, frame, scenarioId);
    }

    @When("I double-click element with selector {string} for scenario ID {string}")
    public void doubleClickElementWithSelector(String selector, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().doubleClickSelector(resolveDynamic(selector));
        LOG.info("Double-clicked selector '{}' for scenario ID: {}", selector, scenarioId);
    }

    @When("I press key {string} on element {string} for scenario ID {string}")
    public void pressKeyOnElement(String key, String element, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().pressKeyOnElement(resolveDynamic(key), resolveDynamic(element));
        LOG.info("Pressed key '{}' on element '{}' for scenario ID: {}", key, element, scenarioId);
    }
}
