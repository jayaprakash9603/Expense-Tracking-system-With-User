package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.steps.ui.support.AdminScenarioCoordinator;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import static org.assertj.core.api.Assertions.assertThat;

public class AdminUiSteps {
    private final AdminScenarioCoordinator coordinator = new AdminScenarioCoordinator();

    @When("the user opens the admin dashboard")
    public void userOpensAdminDashboard() {
        coordinator.navigateToAdminDashboard();
    }

    @When("the user opens user management")
    public void userOpensUserManagement() {
        coordinator.navigateToUserManagement();
    }

    @When("the user opens audit logs")
    public void userOpensAuditLogs() {
        coordinator.navigateToAuditLogs();
    }

    @Then("the admin dashboard should be loaded")
    public void adminDashboardShouldBeLoaded() {
        assertThat(coordinator.isAdminDashboardLoaded()).as("Admin dashboard should be loaded").isTrue();
    }
}
