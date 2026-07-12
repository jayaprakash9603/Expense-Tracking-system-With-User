package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.core.config.RetryPolicy;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import com.jaya.automation.core.util.RetryExecutor;
import com.jaya.automation.flows.auth.model.LoginCredentials;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.Assertions;

import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ScenarioIdUiSteps extends StepDataSupport {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(ScenarioIdUiSteps.class);

    @Given("I want to setup a browser for UI testing for scenarioID {string}")
    public void setupBrowserForScenarioId(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor();
        BddWorld.putScopedValue(scenarioId, "browser.ready", Boolean.TRUE);
        LOG.info("Browser session initialized for scenarioID: {}", scenarioId);
    }

    @Given("I want to login to the UI with username {string} and password {string} for scenarioID {string}")
    public void loginForScenarioId(String username, String password, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        AutomationConfig config = BddWorld.config();
        String resolvedUsername = resolveDynamic(username);
        String resolvedPassword = resolveDynamic(password);
        LoginCredentials credentials = new LoginCredentials(resolvedUsername, resolvedPassword);
        String currentUrl = BddWorld.authUiFlowService().loginSuccessfully(config.baseUrl(), credentials);
        BddWorld.setCurrentUrl(currentUrl);
        BddWorld.putScopedValue(scenarioId, "login.url", currentUrl);
        BddWorld.putScopedValue(scenarioId, "login.user", resolvedUsername);
        LOG.info("Login completed for scenarioID: {} with user: {}", scenarioId, resolvedUsername);
    }

    @When("I want to wait for {int} seconds for scenarioID {string}")
    public void waitForScenarioId(int seconds, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        LOG.info("Waiting {} seconds for scenarioID: {}", seconds, scenarioId);
        try {
            Thread.sleep(seconds * 1000L);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Wait interrupted for scenarioID: " + scenarioId, ex);
        }
    }

    @When("the user navigates to {string} page for scenarioID {string}")
    public void navigateToPageForScenarioId(String pageLabel, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String resolvedLabel = resolveDynamic(pageLabel);
        String pagePath = BddWorld.uiActionExecutor()
                .navigateToTab(resolvedLabel, BddWorld.config().baseUrl());
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
        BddWorld.putScopedValue(scenarioId, "page.label", resolvedLabel);
        BddWorld.putScopedValue(scenarioId, "page.path", pagePath);
        LOG.info("Navigated to '{}' for scenarioID: {}", resolvedLabel, scenarioId);
    }

    @When("the user fills the form with data for scenarioID {string}")
    public void fillFormForScenarioId(String scenarioId, io.cucumber.datatable.DataTable dataTable) {
        BddWorld.registerScenarioId(scenarioId);
        Map<String, String> values = textMap(dataTable);
        BddWorld.uiActionExecutor().fillFields(values);
        LOG.info("Form filled for scenarioID: {} with {} fields", scenarioId, values.size());
    }

    @When("the user clicks {string} for scenarioID {string}")
    public void clickActionForScenarioId(String actionKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor().clickAction(actionKey);
        LOG.info("Clicked '{}' for scenarioID: {}", actionKey, scenarioId);
    }

    @Then("the user should be on {string} page for scenarioID {string}")
    public void verifyPageForScenarioId(String page, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String resolvedPage = resolveDynamic(page);
        Assertions.assertThat(BddWorld.currentUrl()).containsIgnoringCase(resolvedPage);
        BddWorld.putScopedValue(scenarioId, "verified.page", resolvedPage);
    }

    @Then("{string} should be visible for scenarioID {string}")
    public void elementVisibleForScenarioId(String elementKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        boolean visible = BddWorld.uiActionExecutor().isVisible(elementKey);
        Assertions.assertThat(visible)
                .as("Element '%s' should be visible for scenarioID '%s'", elementKey, scenarioId)
                .isTrue();
    }

    @Then("store text at {string} as {string} for scenarioID {string}")
    public void storeTextForScenarioId(String textKey, String alias, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String value = BddWorld.uiActionExecutor().textOf(textKey);
        BddWorld.putScopedValue(scenarioId, alias, value);
        BddWorld.putAliasValue(alias, value);
        BddWorld.putUiValue(alias, value);
    }

    @When("the user confirms the modal for scenarioID {string}")
    public void confirmModalForScenarioId(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor().clickAction("modal-approve");
        LOG.info("Modal confirmed for scenarioID: {}", scenarioId);
    }

    @When("the user cancels the modal for scenarioID {string}")
    public void cancelModalForScenarioId(String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor().clickAction("modal-decline");
        LOG.info("Modal cancelled for scenarioID: {}", scenarioId);
    }

    @Then("the toast message should contain {string} for scenarioID {string}")
    public void toastShouldContainForScenarioId(String expectedText, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String toastText = BddWorld.uiActionExecutor().textOf("toast-message");
        Assertions.assertThat(toastText)
                .as("Toast for scenarioID '%s' should contain '%s'", scenarioId, expectedText)
                .containsIgnoringCase(resolveDynamic(expectedText));
        BddWorld.putScopedValue(scenarioId, "last.toast", toastText);
    }

    @When("the user selects {string} from {string} dropdown for scenarioID {string}")
    public void selectDropdownForScenarioId(String optionText, String dropdownKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor().selectDropdownOption(dropdownKey, resolveDynamic(optionText));
        LOG.info("Selected '{}' from '{}' for scenarioID: {}", optionText, dropdownKey, scenarioId);
    }

    @When("the user waits until {string} is visible for scenarioID {string}")
    public void waitUntilVisibleForScenarioId(String elementKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor().waitUntilVisible(elementKey);
        LOG.info("Element '{}' is visible for scenarioID: {}", elementKey, scenarioId);
    }

    @Then("the current URL should contain {string} for scenarioID {string}")
    public void urlShouldContainForScenarioId(String expectedSegment, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        String currentUrl = BddWorld.uiActionExecutor().currentUrl();
        Assertions.assertThat(currentUrl)
                .as("URL for scenarioID '%s' should contain '%s'", scenarioId, expectedSegment)
                .contains(resolveDynamic(expectedSegment));
    }

    @When("the user searches for {string} for scenarioID {string}")
    public void searchForScenarioId(String searchText, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor().fillField("search-input", resolveDynamic(searchText));
        BddWorld.putScopedValue(scenarioId, "last.search", searchText);
        LOG.info("Search for '{}' executed for scenarioID: {}", searchText, scenarioId);
    }

    @When("the user clicks {string} on the row containing {string} for scenarioID {string}")
    public void clickRowActionForScenarioId(String actionText, String rowIdentifier, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor().clickRowAction(
                resolveDynamic(actionText), resolveDynamic(rowIdentifier));
        LOG.info("Clicked '{}' on row '{}' for scenarioID: {}", actionText, rowIdentifier, scenarioId);
    }

    @When("the user opens the {string} page for scenarioID {string}")
    public void openDomainPageForScenarioId(String domainKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor().navigateToDomain(domainKey, BddWorld.config().baseUrl());
        BddWorld.putScopedValue(scenarioId, "currentDomain", domainKey);
        LOG.info("Opened domain '{}' for scenarioID: {}", domainKey, scenarioId);
    }

    @When("the user fills {string} with {string} for scenarioID {string}")
    public void fillSingleFieldForScenarioId(String fieldKey, String value, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.uiActionExecutor().fillField(fieldKey, resolveDynamic(value));
        LOG.info("Filled '{}' for scenarioID: {}", fieldKey, scenarioId);
    }

    @When("the user resilient clicks {string} for scenarioID {string}")
    public void resilientClickForScenarioId(String actionKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        RetryPolicy policy = BddWorld.config().retrySettings().uiPollRetryPolicy();
        RetryExecutor.executeVoidWithBackoff(
                () -> BddWorld.uiActionExecutor().clickAction(actionKey),
                policy);
        LOG.info("Resilient click '{}' completed for scenarioID: {}", actionKey, scenarioId);
    }

    @When("the user waits for page to be ready at {string} for scenarioID {string}")
    public void waitForPageReadyForScenarioId(String elementKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        long timeoutMs = BddWorld.config().explicitWait().toMillis();
        boolean ready = BddWorld.uiActionExecutor().waitForPageReady(elementKey, timeoutMs);
        Assertions.assertThat(ready)
                .as("Page element '%s' should be visible for scenarioID '%s'", elementKey, scenarioId)
                .isTrue();
        LOG.info("Page ready at '{}' for scenarioID: {}", elementKey, scenarioId);
    }

    @When("the user waits for {string} to be enabled for scenarioID {string}")
    public void waitForElementEnabledForScenarioId(String elementKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        long timeoutMs = BddWorld.config().explicitWait().toMillis();
        boolean enabled = BddWorld.uiActionExecutor().waitForElementEnabled(elementKey, timeoutMs);
        Assertions.assertThat(enabled)
                .as("Element '%s' should be enabled for scenarioID '%s'", elementKey, scenarioId)
                .isTrue();
        LOG.info("Element '{}' is enabled for scenarioID: {}", elementKey, scenarioId);
    }

    @When("the user waits for {string} with refresh for scenarioID {string}")
    public void waitForWithRefreshForScenarioId(String elementKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        RetryPolicy policy = BddWorld.config().retrySettings().uiPollRetryPolicy();
        BddWorld.uiActionExecutor().waitForWithRefresh(
                elementKey, policy.maxAttempts(), policy.initialDelayMs());
        LOG.info("Element '{}' found after refresh polling for scenarioID: {}", elementKey, scenarioId);
    }

    @Then("{string} should be safely visible for scenarioID {string}")
    public void elementSafelyVisibleForScenarioId(String elementKey, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        boolean visible = BddWorld.uiActionExecutor().isVisibleSafe(elementKey);
        Assertions.assertThat(visible)
                .as("Element '%s' should be safely visible for scenarioID '%s'", elementKey, scenarioId)
                .isTrue();
    }

    @When("the user resilient fills the form with data for scenarioID {string}")
    public void resilientFillFormForScenarioId(String scenarioId, io.cucumber.datatable.DataTable dataTable) {
        BddWorld.registerScenarioId(scenarioId);
        Map<String, String> values = textMap(dataTable);
        BddWorld.uiActionExecutor().resilientFillFields(values);
        LOG.info("Resilient form fill for scenarioID: {} with {} fields", scenarioId, values.size());
    }
}
