package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.hooks.ApiCleanupHooks;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.flows.auth.model.SignupData;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.Assertions;

public class SignupUiSteps extends StepDataSupport {
    @When("the user signs up with valid details")
    public void userSignsUpWithValidDetails() {
        SignupData signupData = validSignupData();
        String currentUrl = BddWorld.authUiFlowService()
                .registerSuccessfully(BddWorld.config().baseUrl(), signupData);
        BddWorld.setCurrentUrl(currentUrl);
        BddWorld.putSessionValue("signupEmail", signupData.email());
        BddWorld.putSessionValue("signupPassword", signupData.password());
        ApiCleanupHooks.trackSignupUser(signupData.email(), signupData.password());
    }

    @When("the user tries to sign up with missing mandatory details")
    public void userSignsUpWithMissingMandatoryDetails() {
        String expected = dataValue("expected_signup_error", "");
        String errorMessage = BddWorld.authUiFlowService()
                .registerExpectingValidationError(BddWorld.config().baseUrl(), missingMandatorySignupData(), expected);
        BddWorld.setErrorMessage(errorMessage);
    }

    @Then("the signup error message should contain {string}")
    public void signupErrorMessageShouldContain(String expectedMessage) {
        Assertions.assertThat(BddWorld.errorMessage()).contains(resolveDynamic(expectedMessage));
    }

    private SignupData validSignupData() {
        return new SignupData(
                dataValue("signup_first_name", "Auto"),
                dataValue("signup_last_name", "User"),
                dataValue("signup_email", "${random.email}"),
                dataValue("signup_password", "Valid@1234")
        );
    }

    private SignupData missingMandatorySignupData() {
        return new SignupData(
                dataValue("missing_signup_first_name", ""),
                dataValue("missing_signup_last_name", ""),
                dataValue("missing_signup_email", ""),
                dataValue("missing_signup_password", "")
        );
    }
}
