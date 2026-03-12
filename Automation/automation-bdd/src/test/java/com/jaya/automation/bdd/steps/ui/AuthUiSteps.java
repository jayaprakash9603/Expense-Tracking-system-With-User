package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.core.config.AutomationConfig;
import com.jaya.automation.flows.auth.model.LoginCredentials;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.Assertions;

public class AuthUiSteps extends StepDataSupport {
    @Given("the login flow is ready")
    public void uiAuthFlowIsReady() {
        BddWorld.authUiFlowService();
    }

    @When("the user logs in with test credentials")
    public void userLogsInUsingConfiguredCredentials() {
        AutomationConfig config = BddWorld.config();
        String username = dataValue("username", config.testUsername());
        String password = dataValue("password", config.testPassword());
        LoginCredentials credentials = new LoginCredentials(username, password);
        String currentUrl = BddWorld.authUiFlowService().loginSuccessfully(config.baseUrl(), credentials);
        BddWorld.setCurrentUrl(currentUrl);
    }

    @Then("the user should see the dashboard")
    public void userIsRedirectedToDashboard() {
        Assertions.assertThat(BddWorld.currentUrl()).contains("/dashboard");
    }

    @When("the user tries to log in with invalid credentials")
    public void userLogsInUsingInvalidCredentials() {
        AutomationConfig config = BddWorld.config();
        String username = dataValue("invalid_username", "invalid@example.test");
        String password = dataValue("invalid_password", "invalid-password");
        String expected = dataValue("expected_error", "");
        LoginCredentials credentials = new LoginCredentials(username, password);
        String errorMessage = BddWorld.authUiFlowService().loginExpectingError(config.baseUrl(), credentials, expected);
        BddWorld.setErrorMessage(errorMessage);
    }

    @Then("the login error message should contain {string}")
    public void loginErrorContains(String expectedError) {
        Assertions.assertThat(BddWorld.errorMessage()).contains(expectedError);
    }
}
