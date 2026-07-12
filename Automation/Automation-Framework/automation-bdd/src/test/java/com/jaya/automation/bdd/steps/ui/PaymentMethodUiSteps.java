package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.bdd.steps.ui.support.PaymentMethodScenarioCoordinator;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import org.springframework.stereotype.Component;

import static org.assertj.core.api.Assertions.assertThat;

@Component
public class PaymentMethodUiSteps extends StepDataSupport {
    private final PaymentMethodScenarioCoordinator coordinator = new PaymentMethodScenarioCoordinator();

    @When("the user adds a payment method with details")
    public void userAddsPaymentMethodWithDetails(DataTable dataTable) {
        coordinator.addPaymentMethod(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user edits the payment method with details")
    public void userEditsPaymentMethodWithDetails(DataTable dataTable) {
        coordinator.editPaymentMethod(textMap(dataTable), this::resolveDynamic);
    }

    @When("the user deletes the current payment method")
    public void userDeletesCurrentPaymentMethod() {
        coordinator.deleteCurrentPaymentMethod();
    }

    @Then("the added payment method should be visible")
    public void addedPaymentMethodShouldBeVisible() {
        assertThat(coordinator.isPaymentMethodVisible()).as("Added payment method should be visible").isTrue();
    }

    @Then("the edited payment method should be visible")
    public void editedPaymentMethodShouldBeVisible() {
        assertThat(coordinator.isPaymentMethodVisible()).as("Edited payment method should be visible").isTrue();
    }

    @Then("the payment method should be removed from the list")
    public void paymentMethodShouldBeRemovedFromList() {
        assertThat(coordinator.isPaymentMethodVisible()).as("Payment method should be removed").isFalse();
    }
}
