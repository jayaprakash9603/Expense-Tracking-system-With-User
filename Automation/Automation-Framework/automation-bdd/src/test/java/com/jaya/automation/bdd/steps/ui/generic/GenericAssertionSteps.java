package com.jaya.automation.bdd.steps.ui.generic;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import io.cucumber.java.en.Then;
import org.assertj.core.api.Assertions;

public class GenericAssertionSteps extends StepDataSupport {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(GenericAssertionSteps.class);

    @Then("I verify page title contains {string} for scenario ID {string}")
    public void verifyPageTitleContains(String expected, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String actual = BddWorld.genericUiActions().pageTitle();
        Assertions.assertThat(actual)
                .as("Page title for scenario ID '%s' should contain '%s'", scenarioId, expected)
                .containsIgnoringCase(resolveDynamic(expected));
        LOG.info("Verified page title contains '{}' for scenario ID: {}", expected, scenarioId);
    }

    @Then("I verify page title is exactly {string} for scenario ID {string}")
    public void verifyPageTitleExactly(String expected, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String actual = BddWorld.genericUiActions().pageTitle();
        Assertions.assertThat(actual)
                .as("Page title for scenario ID '%s' should be exactly '%s'", scenarioId, expected)
                .isEqualTo(resolveDynamic(expected));
        LOG.info("Verified page title is exactly '{}' for scenario ID: {}", expected, scenarioId);
    }

    @Then("I verify page URL contains {string} for scenario ID {string}")
    public void verifyPageUrlContains(String expected, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String actual = BddWorld.genericUiActions().currentUrl();
        Assertions.assertThat(actual)
                .as("Page URL for scenario ID '%s' should contain '%s'", scenarioId, expected)
                .contains(resolveDynamic(expected));
        LOG.info("Verified page URL contains '{}' for scenario ID: {}", expected, scenarioId);
    }

    @Then("I verify page URL is exactly {string} for scenario ID {string}")
    public void verifyPageUrlExactly(String expected, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String actual = BddWorld.genericUiActions().currentUrl();
        Assertions.assertThat(actual)
                .as("Page URL for scenario ID '%s' should be exactly '%s'", scenarioId, expected)
                .isEqualTo(resolveDynamic(expected));
        LOG.info("Verified page URL is exactly '{}' for scenario ID: {}", expected, scenarioId);
    }

    @Then("I verify element {string} is visible for scenario ID {string}")
    public void verifyElementVisible(String element, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        boolean visible = BddWorld.genericUiActions().isElementVisible(resolveDynamic(element));
        Assertions.assertThat(visible)
                .as("Element '%s' should be visible for scenario ID '%s'", element, scenarioId)
                .isTrue();
        LOG.info("Verified element '{}' is visible for scenario ID: {}", element, scenarioId);
    }

    @Then("I verify element {string} is visible for scenario ID {string} under iFrame {string}")
    public void verifyElementVisibleUnderIframe(String element, String scenarioId, String frame) {
        BddWorld.registerScenarioId(scenarioId);
        boolean visible = BddWorld.genericUiActions().isElementVisibleInFrame(
                resolveDynamic(element), resolveDynamic(frame));
        Assertions.assertThat(visible)
                .as("Element '%s' should be visible under iFrame '%s' for scenario ID '%s'",
                        element, frame, scenarioId)
                .isTrue();
        LOG.info("Verified element '{}' is visible under iFrame '{}' for scenario ID: {}",
                element, frame, scenarioId);
    }

    @Then("I verify element {string} is visible in frame {string} for scenario ID {string}")
    public void verifyElementVisibleInFrame(String element, String frame, String scenarioId) {
        verifyElementVisibleUnderIframe(element, scenarioId, frame);
    }

    @Then("I verify element {string} is visible within {double} milliseconds for scenario ID {string}")
    public void verifyElementVisibleWithin(String element, double timeoutMs, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        boolean visible = BddWorld.genericUiActions().isElementVisibleWithin(
                resolveDynamic(element), (long) timeoutMs);
        Assertions.assertThat(visible)
                .as("Element '%s' should be visible within %sms for scenario ID '%s'",
                        element, timeoutMs, scenarioId)
                .isTrue();
        LOG.info("Verified element '{}' is visible within {}ms for scenario ID: {}", element, timeoutMs, scenarioId);
    }

    @Then("I verify element {string} exists for scenario ID {string}")
    public void verifyElementExists(String element, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        boolean exists = BddWorld.genericUiActions().elementExists(resolveDynamic(element));
        Assertions.assertThat(exists)
                .as("Element '%s' should exist for scenario ID '%s'", element, scenarioId)
                .isTrue();
        LOG.info("Verified element '{}' exists for scenario ID: {}", element, scenarioId);
    }

    @Then("I verify element {string} has exact text {string} for scenario ID {string}")
    public void verifyElementHasExactText(String element, String expectedText, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String actual = BddWorld.genericUiActions().elementText(resolveDynamic(element));
        Assertions.assertThat(actual)
                .as("Element '%s' text for scenario ID '%s'", element, scenarioId)
                .isEqualTo(resolveDynamic(expectedText));
        LOG.info("Verified element '{}' has exact text for scenario ID: {}", element, scenarioId);
    }

    @Then("I verify element {string} has exact text {string} for scenario ID {string} under iFrame {string}")
    public void verifyElementHasExactTextUnderIframe(String element, String expectedText, String scenarioId, String frame) {
        BddWorld.registerScenarioId(scenarioId);
        String actual = BddWorld.genericUiActions().elementTextInFrame(
                resolveDynamic(element), resolveDynamic(frame));
        Assertions.assertThat(actual)
                .as("Element '%s' text under iFrame '%s' for scenario ID '%s'", element, frame, scenarioId)
                .isEqualTo(resolveDynamic(expectedText));
        LOG.info("Verified element '{}' has exact text under iFrame '{}' for scenario ID: {}",
                element, frame, scenarioId);
    }

    @Then("I verify element {string} contains text {string} for scenario ID {string}")
    public void verifyElementContainsText(String element, String expectedText, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        boolean contains = BddWorld.genericUiActions().elementContainsText(
                resolveDynamic(element), resolveDynamic(expectedText));
        Assertions.assertThat(contains)
                .as("Element '%s' should contain text '%s' for scenario ID '%s'",
                        element, expectedText, scenarioId)
                .isTrue();
        LOG.info("Verified element '{}' contains text for scenario ID: {}", element, scenarioId);
    }

    @Then("I verify element {string} contains text {string} for scenario ID {string} under iFrame {string}")
    public void verifyElementContainsTextUnderIframe(String element, String expectedText, String scenarioId, String frame) {
        BddWorld.registerScenarioId(scenarioId);
        boolean contains = BddWorld.genericUiActions().elementContainsTextInFrame(
                resolveDynamic(element), resolveDynamic(expectedText), resolveDynamic(frame));
        Assertions.assertThat(contains)
                .as("Element '%s' under iFrame '%s' should contain text '%s' for scenario ID '%s'",
                        element, frame, expectedText, scenarioId)
                .isTrue();
        LOG.info("Verified element '{}' contains text under iFrame '{}' for scenario ID: {}",
                element, frame, scenarioId);
    }

    @Then("I verify text {string} is present in element {string} for scenario ID {string}")
    public void verifyTextPresentInElement(String expectedText, String element, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        boolean present = BddWorld.genericUiActions().textPresentInElement(
                resolveDynamic(expectedText), resolveDynamic(element));
        Assertions.assertThat(present)
                .as("Text '%s' should be present in element '%s' for scenario ID '%s'",
                        expectedText, element, scenarioId)
                .isTrue();
        LOG.info("Verified text '{}' is present in element '{}' for scenario ID: {}",
                expectedText, element, scenarioId);
    }
}
