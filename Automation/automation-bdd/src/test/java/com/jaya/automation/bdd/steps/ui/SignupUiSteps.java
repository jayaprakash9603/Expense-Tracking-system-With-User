package com.jaya.automation.bdd.steps.ui;

import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.bdd.steps.ui.support.AuthSessionCoordinator;
import com.jaya.automation.bdd.steps.ui.support.SignupPayloadFactory;
import com.jaya.automation.flows.auth.model.SignupData;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.Assertions;

public class SignupUiSteps extends StepDataSupport {
    private final SignupPayloadFactory signupPayloadFactory = new SignupPayloadFactory();
    private final AuthSessionCoordinator authSessionCoordinator = new AuthSessionCoordinator();

    @When("the user signs up with valid details")
    public void userSignsUpWithValidDetails() {
        SignupData signupData = signupPayloadFactory.valid(BddWorld.dataRow(), this::resolveDynamic);
        String currentUrl = BddWorld.authUiFlowService()
                .registerSuccessfully(BddWorld.config().baseUrl(), signupData);
        BddWorld.setCurrentUrl(currentUrl);
        authSessionCoordinator.rememberSignedUpUser(signupData);
    }

    @When("the user tries to sign up with missing mandatory details")
    public void userSignsUpWithMissingMandatoryDetails() {
        String errorMessage = BddWorld.authUiFlowService()
                .registerExpectingValidationError(
                        BddWorld.config().baseUrl(),
                        signupPayloadFactory.missingMandatory(BddWorld.dataRow(), this::resolveDynamic),
                        dataValue("expected_signup_error", "")
                );
        BddWorld.setErrorMessage(errorMessage);
    }

    @Then("the signup error message should contain {string}")
    public void signupErrorMessageShouldContain(String expectedMessage) {
        Assertions.assertThat(BddWorld.errorMessage()).contains(resolveDynamic(expectedMessage));
    }
}
