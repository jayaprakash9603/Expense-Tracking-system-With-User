package com.jaya.automation.bdd.steps.ui.generic;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.When;

import java.util.Map;

public class GenericFormSteps extends StepDataSupport {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(GenericFormSteps.class);

    @When("I fill text field {string} with value {string} for scenario ID {string}")
    public void fillTextField(String field, String value, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().fillTextField(resolveDynamic(field), resolveDynamic(value));
        LOG.info("Filled text field '{}' for scenario ID: {}", field, scenarioId);
    }

    @When("I fill text field with name {string} with value {string} for scenario ID {string}")
    public void fillTextFieldByName(String name, String value, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().fillTextFieldByName(resolveDynamic(name), resolveDynamic(value));
        LOG.info("Filled text field name '{}' for scenario ID: {}", name, scenarioId);
    }

    @When("I fill text field with selector {string} with value {string} for scenario ID {string}")
    public void fillTextFieldBySelector(String selector, String value, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().fillTextFieldBySelector(resolveDynamic(selector), resolveDynamic(value));
        LOG.info("Filled text field selector '{}' for scenario ID: {}", selector, scenarioId);
    }

    @When("I fill textarea {string} with value {string} for scenario ID {string}")
    public void fillTextarea(String field, String value, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().fillTextarea(resolveDynamic(field), resolveDynamic(value));
        LOG.info("Filled textarea '{}' for scenario ID: {}", field, scenarioId);
    }

    @When("I select option {string} from dropdown {string} for scenario ID {string}")
    public void selectOptionFromDropdown(String optionText, String dropdown, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().selectDropdownOption(resolveDynamic(optionText), resolveDynamic(dropdown));
        LOG.info("Selected '{}' from dropdown '{}' for scenario ID: {}", optionText, dropdown, scenarioId);
    }

    @When("I select option {string} from select box with name {string} for scenario ID {string}")
    public void selectOptionFromSelectBoxWithName(String optionText, String name, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().selectDropdownOptionByName(resolveDynamic(optionText), resolveDynamic(name));
        LOG.info("Selected '{}' from select name '{}' for scenario ID: {}", optionText, name, scenarioId);
    }

    @When("I select radio button {string} with value {string} for scenario ID {string}")
    public void selectRadioButton(String group, String value, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().selectRadioButton(resolveDynamic(group), resolveDynamic(value));
        LOG.info("Selected radio '{}' value '{}' for scenario ID: {}", group, value, scenarioId);
    }

    @When("I check checkbox {string} for scenario ID {string}")
    public void checkCheckbox(String checkbox, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().checkCheckbox(resolveDynamic(checkbox));
        LOG.info("Checked checkbox '{}' for scenario ID: {}", checkbox, scenarioId);
    }

    @When("I check checkbox {string} for scenario ID {string} under iFrame {string}")
    public void checkCheckboxUnderIframe(String checkbox, String scenarioId, String frame) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().checkCheckboxInFrame(resolveDynamic(checkbox), resolveDynamic(frame));
        LOG.info("Checked checkbox '{}' under iFrame '{}' for scenario ID: {}", checkbox, frame, scenarioId);
    }

    @When("I uncheck checkbox {string} for scenario ID {string}")
    public void uncheckCheckbox(String checkbox, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().uncheckCheckbox(resolveDynamic(checkbox));
        LOG.info("Unchecked checkbox '{}' for scenario ID: {}", checkbox, scenarioId);
    }

    @When("I uncheck checkbox {string} for scenario ID {string} under iFrame {string}")
    public void uncheckCheckboxUnderIframe(String checkbox, String scenarioId, String frame) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().uncheckCheckboxInFrame(resolveDynamic(checkbox), resolveDynamic(frame));
        LOG.info("Unchecked checkbox '{}' under iFrame '{}' for scenario ID: {}", checkbox, frame, scenarioId);
    }

    @When("I populate form fields for scenario ID {string}:")
    public void populateFormFields(String scenarioId, DataTable dataTable) {
        BddWorld.registerScenarioId(scenarioId);
        Map<String, String> values = textMap(dataTable);
        BddWorld.genericUiActions().populateFormFields(values);
        LOG.info("Populated {} form fields for scenario ID: {}", values.size(), scenarioId);
    }

    @When("I select date {string} in calendar with icon {string} for scenario ID {string}")
    public void selectDateInCalendar(String date, String icon, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().selectDateInCalendar(resolveDynamic(date), resolveDynamic(icon));
        LOG.info("Selected date '{}' with icon '{}' for scenario ID: {}", date, icon, scenarioId);
    }

    @When("I select date {string} in calendar with icon {string} in frame {string} for scenario ID {string}")
    public void selectDateInCalendarInFrame(String date, String icon, String frame, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().selectDateInCalendar(
                resolveDynamic(date), resolveDynamic(icon), resolveDynamic(frame));
        LOG.info("Selected date '{}' with icon '{}' in frame '{}' for scenario ID: {}",
                date, icon, frame, scenarioId);
    }

    @When("I select today in calendar with icon {string} for scenario ID {string}")
    public void selectTodayInCalendar(String icon, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().selectTodayInCalendar(resolveDynamic(icon));
        LOG.info("Selected today with icon '{}' for scenario ID: {}", icon, scenarioId);
    }

    @When("I clear calendar selection with icon {string} for scenario ID {string}")
    public void clearCalendarSelection(String icon, String scenarioId) {
        BddWorld.registerScenarioId(scenarioId);
        BddWorld.genericUiActions().clearCalendarSelection(resolveDynamic(icon));
        LOG.info("Cleared calendar selection with icon '{}' for scenario ID: {}", icon, scenarioId);
    }
}
