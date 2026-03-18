package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.context.BddWorld;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import static org.assertj.core.api.Assertions.assertThat;

public class NavigationUiSteps {

    @When("the user switches to admin mode")
    public void userSwitchesToAdminMode() {
        BddWorld.uiActionExecutor().clickAction("mode.switch.admin");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    @When("the user switches to user mode")
    public void userSwitchesToUserMode() {
        BddWorld.uiActionExecutor().clickAction("mode.switch.user");
        BddWorld.setCurrentUrl(BddWorld.uiActionExecutor().currentUrl());
    }

    @Then("the navigation URL should contain {string}")
    public void navigationUrlShouldContain(String fragment) {
        String currentUrl = BddWorld.uiActionExecutor().currentUrl();
        assertThat(currentUrl).as("Current URL should contain " + fragment).contains(fragment);
    }
}
