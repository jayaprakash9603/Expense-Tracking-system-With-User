package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.bdd.steps.ui.support.UiDataRowMapper;
import com.jaya.automation.core.config.RetryPolicy;
import com.jaya.automation.core.util.RetryExecutor;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.Assertions;


import java.util.Map;

public class HybridUiSteps extends StepDataSupport {
    private final UiDataRowMapper uiDataRowMapper = new UiDataRowMapper();

    @Given("ui testing is ready")
    public void genericUiExecutorIsReady() {
        BddWorld.uiActionExecutor();
    }

    @Given("the user is on {string} page")
    public void userIsOnPage(String pageLabel) {
        String resolvedLabel = resolveDynamic(pageLabel);
        String pagePath = BddWorld.uiActionExecutor()
                .navigateToTab(resolvedLabel, BddWorld.config().baseUrl());
        BddWorld.putUiValue("currentTabLabel", resolvedLabel);
        BddWorld.putUiValue("currentTabPath", pagePath);
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    @When("the user opens the {string} page")
    public void userNavigatesToDomainPage(String domainKey) {
        BddWorld.uiActionExecutor().navigateToDomain(domainKey, BddWorld.config().baseUrl());
        BddWorld.putUiValue("currentDomain", domainKey);
        BddWorld.setCurrentUrl(BddWorld.config().baseUrl() + "/" + domainKey);
    }

    @When("the user fills the form with data")
    public void userFillsUiFormWithData(DataTable dataTable) {
        Map<String, String> values = textMap(dataTable);
        BddWorld.uiActionExecutor().fillFields(values);
    }

    @When("the user fills the form from the current data row")
    public void userFillsUiFormFromCurrentDataRow() {
        Map<String, String> allValues = BddWorld.scenarioDataBinder().resolveMap(BddWorld.dataRow());
        Map<String, String> uiValues = uiDataRowMapper.extractUiValues(allValues);
        BddWorld.uiActionExecutor().fillFields(uiValues);
    }

    @When("the user clicks {string}")
    public void userClicksUiAction(String actionKey) {
        BddWorld.uiActionExecutor().clickAction(actionKey);
    }

    @When("the user redirects to the {string} tab")
    public void userRedirectsToTheTab(String tabLabel) {
        String resolvedLabel = resolveDynamic(tabLabel);
        String tabPath = BddWorld.uiActionExecutor()
                .navigateToTab(resolvedLabel, BddWorld.config().baseUrl());
        String currentUrl = BddWorld.uiActionExecutor().currentUrl();
        BddWorld.putUiValue("currentTabLabel", resolvedLabel);
        BddWorld.putUiValue("currentTabPath", tabPath);
        BddWorld.setCurrentUrl(currentUrl);
    }

    @Then("the {string} tab page should be opened")
    public void theTabPageShouldBeOpened(String tabLabel) {
        String expectedPath = BddWorld.uiActionExecutor().resolveTabPath(resolveDynamic(tabLabel));
        Assertions.assertThat(BddWorld.currentUrl()).contains(expectedPath);
    }

    @Then("the text at {string} should contain {string}")
    public void uiTextKeyShouldContain(String textKey, String expectedText) {
        String actualText = BddWorld.uiActionExecutor().textOf(textKey);
        Assertions.assertThat(actualText).contains(resolveDynamic(expectedText));
    }

    @Then("{string} should be visible on the page")
    public void uiElementShouldBeVisible(String elementKey) {
        boolean visible = BddWorld.uiActionExecutor().isVisible(elementKey);
        Assertions.assertThat(visible).isTrue();
    }

    @Then("store text at {string} as {string}")
    public void saveUiTextAsAlias(String textKey, String alias) {
        String value = BddWorld.uiActionExecutor().textOf(textKey);
        BddWorld.putAliasValue(alias, value);
        BddWorld.putUiValue(alias, value);
    }

    @When("the user confirms the modal")
    public void userConfirmsModal() {
        BddWorld.uiActionExecutor().clickAction("modal-approve");
    }

    @When("the user cancels the modal")
    public void userCancelsModal() {
        BddWorld.uiActionExecutor().clickAction("modal-decline");
    }

    @Then("the toast message should contain {string}")
    public void toastMessageShouldContain(String expectedText) {
        String toastText = BddWorld.uiActionExecutor().textOf("toast-message");
        Assertions.assertThat(toastText)
                .as("Toast message should contain '%s'", expectedText)
                .containsIgnoringCase(resolveDynamic(expectedText));
    }

    @When("the user selects {string} from {string} dropdown")
    public void userSelectsFromDropdown(String optionText, String dropdownKey) {
        BddWorld.uiActionExecutor().selectDropdownOption(dropdownKey, resolveDynamic(optionText));
    }

    @When("the user waits until {string} is visible")
    public void userWaitsUntilVisible(String elementKey) {
        BddWorld.uiActionExecutor().waitUntilVisible(elementKey);
    }

    @Then("the current URL should contain {string}")
    public void currentUrlShouldContain(String expectedSegment) {
        String currentUrl = BddWorld.uiActionExecutor().currentUrl();
        Assertions.assertThat(currentUrl)
                .as("URL should contain '%s'", expectedSegment)
                .contains(resolveDynamic(expectedSegment));
    }

    @When("the user searches for {string}")
    public void userSearchesFor(String searchText) {
        BddWorld.uiActionExecutor().fillField("search-input", resolveDynamic(searchText));
    }

    @When("the user clicks {string} on the row containing {string}")
    public void userClicksActionOnRow(String actionText, String rowIdentifier) {
        BddWorld.uiActionExecutor().clickRowAction(
                resolveDynamic(actionText), resolveDynamic(rowIdentifier));
    }

    @Then("the list {string} should have at least {int} items")
    public void listShouldHaveAtLeastItems(String listKey, int expectedCount) {
        String countText = BddWorld.uiActionExecutor().textOf(listKey);
        int actualCount = extractNumber(countText);
        Assertions.assertThat(actualCount)
                .as("List '%s' should have at least %d items", listKey, expectedCount)
                .isGreaterThanOrEqualTo(expectedCount);
    }

    @When("the user fills {string} with {string}")
    public void userFillsSingleField(String fieldKey, String value) {
        BddWorld.uiActionExecutor().fillField(fieldKey, resolveDynamic(value));
    }

    @When("the user waits for {int} seconds")
    public void userWaitsForSeconds(int seconds) {
        try {
            Thread.sleep(seconds * 1000L);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Wait interrupted", ex);
        }
    }

    @Then("{string} should exist on the page")
    public void elementShouldExistOnPage(String elementKey) {
        boolean exists = BddWorld.uiActionExecutor().elementExists(elementKey);
        Assertions.assertThat(exists)
                .as("Element '%s' should exist", elementKey)
                .isTrue();
    }

    @When("the user resilient clicks {string}")
    public void userResilientClicks(String actionKey) {
        RetryPolicy policy = BddWorld.config().retrySettings().uiPollRetryPolicy();
        RetryExecutor.executeVoidWithBackoff(
                () -> BddWorld.uiActionExecutor().clickAction(actionKey),
                policy);
    }

    @When("the user waits for page to be ready at {string}")
    public void userWaitsForPageReady(String elementKey) {
        long timeoutMs = BddWorld.config().explicitWait().toMillis();
        boolean ready = BddWorld.uiActionExecutor().waitForPageReady(elementKey, timeoutMs);
        Assertions.assertThat(ready)
                .as("Page element '%s' should be visible", elementKey)
                .isTrue();
    }

    @When("the user waits for {string} to be enabled")
    public void userWaitsForElementEnabled(String elementKey) {
        long timeoutMs = BddWorld.config().explicitWait().toMillis();
        boolean enabled = BddWorld.uiActionExecutor().waitForElementEnabled(elementKey, timeoutMs);
        Assertions.assertThat(enabled)
                .as("Element '%s' should be enabled", elementKey)
                .isTrue();
    }

    @When("the user resilient fills the form with data")
    public void userResilientFillsForm(DataTable dataTable) {
        Map<String, String> values = textMap(dataTable);
        BddWorld.uiActionExecutor().resilientFillFields(values);
    }

    @Then("{string} should be safely visible on the page")
    public void elementSafelyVisible(String elementKey) {
        boolean visible = BddWorld.uiActionExecutor().isVisibleSafe(elementKey);
        Assertions.assertThat(visible)
                .as("Element '%s' should be safely visible", elementKey)
                .isTrue();
    }

    private int extractNumber(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }
        String digits = text.replaceAll("[^0-9]", "");
        return digits.isEmpty() ? 0 : Integer.parseInt(digits);
    }
}
