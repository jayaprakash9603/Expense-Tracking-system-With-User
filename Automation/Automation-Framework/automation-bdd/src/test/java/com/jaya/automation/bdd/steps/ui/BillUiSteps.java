package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.bdd.steps.ui.support.BillScenarioCoordinator;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;


import static org.assertj.core.api.Assertions.assertThat;

public class BillUiSteps extends StepDataSupport {
    private final BillScenarioCoordinator coordinator = new BillScenarioCoordinator();

    @When("the user adds a bill with details")
    public void userAddsBillWithDetails(DataTable dataTable) {
        coordinator.addBill(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user edits the bill with details")
    public void userEditsBillWithDetails(DataTable dataTable) {
        coordinator.editBill(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user deletes the current bill")
    public void userDeletesCurrentBill() {
        coordinator.deleteCurrentBill();
    }

    @Then("the added bill should be visible")
    public void addedBillShouldBeVisible() {
        assertThat(coordinator.isBillVisible()).as("Added bill should be visible").isTrue();
    }

    @Then("the edited bill should be visible")
    public void editedBillShouldBeVisible() {
        assertThat(coordinator.isBillVisible()).as("Edited bill should be visible").isTrue();
    }

    @Then("the bill should be removed from the list")
    public void billShouldBeRemovedFromList() {
        assertThat(coordinator.isBillVisible()).as("Bill should be removed").isFalse();
    }
}
