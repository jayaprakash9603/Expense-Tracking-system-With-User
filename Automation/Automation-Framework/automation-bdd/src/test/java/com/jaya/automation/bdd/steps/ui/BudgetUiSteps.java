package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.bdd.steps.ui.support.BudgetScenarioCoordinator;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import org.springframework.stereotype.Component;

import static org.assertj.core.api.Assertions.assertThat;

@Component
public class BudgetUiSteps extends StepDataSupport {
    private final BudgetScenarioCoordinator coordinator = new BudgetScenarioCoordinator();

    @When("the user adds a budget with details")
    public void userAddsBudgetWithDetails(DataTable dataTable) {
        coordinator.addBudget(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user edits the budget with details")
    public void userEditsBudgetWithDetails(DataTable dataTable) {
        coordinator.editBudget(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user deletes the current budget")
    public void userDeletesCurrentBudget() {
        coordinator.deleteCurrentBudget();
    }

    @Then("the added budget should be visible")
    public void addedBudgetShouldBeVisible() {
        assertThat(coordinator.isBudgetVisible()).as("Added budget should be visible").isTrue();
    }

    @Then("the edited budget should be visible")
    public void editedBudgetShouldBeVisible() {
        assertThat(coordinator.isBudgetVisible()).as("Edited budget should be visible").isTrue();
    }

    @Then("the budget should be removed from the list")
    public void budgetShouldBeRemovedFromList() {
        assertThat(coordinator.isBudgetDeleted()).as("Budget should be removed").isTrue();
    }
}
