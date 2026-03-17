package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.bdd.steps.ui.support.CategoryScenarioCoordinator;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import static org.assertj.core.api.Assertions.assertThat;

public class CategoryUiSteps extends StepDataSupport {
    private final CategoryScenarioCoordinator coordinator = new CategoryScenarioCoordinator();

    @When("the user adds a category with details")
    public void userAddsCategoryWithDetails(DataTable dataTable) {
        coordinator.addCategory(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user edits the category with details")
    public void userEditsCategoryWithDetails(DataTable dataTable) {
        coordinator.editCategory(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user deletes the current category")
    public void userDeletesCurrentCategory() {
        coordinator.deleteCurrentCategory();
    }

    @Then("the added category should be visible")
    public void addedCategoryShouldBeVisible() {
        assertThat(coordinator.isCategoryVisible()).as("Added category should be visible").isTrue();
    }

    @Then("the edited category should be visible")
    public void editedCategoryShouldBeVisible() {
        assertThat(coordinator.isCategoryVisible()).as("Edited category should be visible").isTrue();
    }

    @Then("the category should be removed from the list")
    public void categoryShouldBeRemovedFromList() {
        assertThat(coordinator.isCategoryVisible()).as("Category should be removed").isFalse();
    }
}
