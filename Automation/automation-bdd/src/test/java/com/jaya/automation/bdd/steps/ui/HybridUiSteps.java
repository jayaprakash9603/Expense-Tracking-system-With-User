package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.Assertions;

import java.util.LinkedHashMap;
import java.util.Map;

public class HybridUiSteps extends StepDataSupport {
    @Given("ui testing is ready")
    public void genericUiExecutorIsReady() {
        BddWorld.uiActionExecutor();
    }

    @When("the user opens the {string} page")
    public void userNavigatesToDomainPage(String domainKey) {
        BddWorld.uiActionExecutor().navigateToDomain(domainKey, BddWorld.config().baseUrl());
        BddWorld.putUiValue("currentDomain", domainKey);
    }

    @Then("the {string} page should be displayed")
    public void domainPageShouldBeLoaded(String domainKey) {
        boolean loaded = BddWorld.uiActionExecutor().isDomainLoaded(domainKey);
        Assertions.assertThat(loaded).isTrue();
    }

    @When("the user fills the form with data")
    public void userFillsUiFormWithData(DataTable dataTable) {
        Map<String, String> values = textMap(dataTable);
        BddWorld.uiActionExecutor().fillFields(values);
    }

    @When("the user fills the form from the current data row")
    public void userFillsUiFormFromCurrentDataRow() {
        Map<String, String> allValues = BddWorld.scenarioDataBinder().resolveMap(BddWorld.dataRow());
        Map<String, String> uiValues = extractUiValues(allValues);
        BddWorld.uiActionExecutor().fillFields(uiValues);
    }

    @When("the user clicks {string}")
    public void userClicksUiAction(String actionKey) {
        BddWorld.uiActionExecutor().clickAction(actionKey);
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

    private Map<String, String> extractUiValues(Map<String, String> allValues) {
        Map<String, String> uiValues = new LinkedHashMap<>();
        allValues.forEach((key, value) -> {
            if (key.startsWith("ui.")) {
                uiValues.put(key.substring(3), value);
            }
        });
        if (!uiValues.isEmpty()) {
            return uiValues;
        }
        return allValues;
    }
}
