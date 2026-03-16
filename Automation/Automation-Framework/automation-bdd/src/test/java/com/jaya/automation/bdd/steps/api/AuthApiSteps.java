package com.jaya.automation.bdd.steps.api;

import com.jaya.automation.api.model.AuthSigninRequest;
import com.jaya.automation.api.model.AuthSigninResponse;
import com.jaya.automation.api.model.UserProfileResponse;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import com.jaya.automation.core.config.AutomationConfig;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.assertj.core.api.Assertions;
import org.testng.SkipException;

public class AuthApiSteps extends StepDataSupport {
    @Given("the sign-in api is ready")
    public void apiAuthClientsAreReady() {
        BddWorld.authApiClient();
        BddWorld.userProfileApiClient();
    }

    @When("the user signs in with test credentials")
    public void clientSignsInWithConfiguredCredentials() {
        AutomationConfig config = BddWorld.config();
        String username = dataValue("username", config.testUsername());
        String password = dataValue("password", config.testPassword());
        AuthSigninRequest request = new AuthSigninRequest(username, password);
        AuthSigninResponse response = BddWorld.authApiClient().signIn(request);
        BddWorld.setSigninResponse(response);
        skipForOtpOrMfa(response);
        if (response.getJwt() != null && !response.getJwt().isBlank()) {
            BddWorld.setJwtToken(response.getJwt());
        }
    }

    @Then("sign-in returns an access token")
    public void signinReturnsAJwtToken() {
        Assertions.assertThat(BddWorld.signinResponse().getJwt()).isNotBlank();
    }

    @Then("the profile should match the signed-in user")
    public void profileEndpointReturnsConfiguredUser() {
        UserProfileResponse profile = BddWorld.userProfileApiClient().getProfile(BddWorld.jwtToken());
        BddWorld.setProfileResponse(profile);
        String expectedEmail = dataValue("username", BddWorld.config().testUsername());
        Assertions.assertThat(profile.getEmail()).isEqualToIgnoringCase(expectedEmail);
    }

    private void skipForOtpOrMfa(AuthSigninResponse response) {
        if (Boolean.TRUE.equals(response.getTwoFactorRequired())) {
            throw new SkipException("Configured user requires OTP. Use non-OTP user for @api @smoke.");
        }
        if (Boolean.TRUE.equals(response.getMfaRequired())) {
            throw new SkipException("Configured user requires MFA. Use non-MFA user for @api @smoke.");
        }
    }
}
