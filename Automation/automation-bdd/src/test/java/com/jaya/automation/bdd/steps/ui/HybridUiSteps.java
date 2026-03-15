package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.bdd.steps.ui.support.UiDataRowMapper;
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
}
