package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.bdd.steps.ui.support.ExpenseScenarioCoordinator;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.Assertions;

public class ExpenseUiSteps extends StepDataSupport {
    private final ExpenseScenarioCoordinator expenseScenarioCoordinator = new ExpenseScenarioCoordinator();

    @When("the user adds an expense with details")
    public void userAddsAnExpenseWithDetails(DataTable dataTable) {
        expenseScenarioCoordinator.addExpense(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user edits the expense with details")
    public void userEditsTheExpenseWithDetails(DataTable dataTable) {
        expenseScenarioCoordinator.editExpense(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user deletes the current expense")
    public void userDeletesTheCurrentExpense() {
        expenseScenarioCoordinator.deleteCurrentExpense();
    }

    @Then("the added expense should be visible")
    public void theAddedExpenseShouldBeVisible() {
        Assertions.assertThat(expenseScenarioCoordinator.isOriginalExpenseVisible()).isTrue();
    }

    @Then("the edited expense should be visible")
    public void theEditedExpenseShouldBeVisible() {
        Assertions.assertThat(expenseScenarioCoordinator.isUpdatedExpenseVisible()).isTrue();
    }

    @Then("the expense should be removed from the list")
    public void theExpenseShouldBeRemovedFromTheList() {
        Assertions.assertThat(expenseScenarioCoordinator.isExpenseDeleted()).isTrue();
    }
}
