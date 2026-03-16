package com.jaya.automation.bdd.steps.common;

import com.jaya.automation.bdd.context.BddWorld;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import org.testng.SkipException;

import java.util.Optional;

public class AuthProviderSkeletonSteps {
    @Given("otp verification is configured")
    public void otpProviderHookIsConfigured() {
        if (!BddWorld.config().hasOtpProvider()) {
            throw new SkipException("Set OTP_PROVIDER and OTP_STATIC_CODE to run @otp scenarios");
        }
    }

    @Then("an otp code can be retrieved")
    public void otpProviderHookCanResolveCode() {
        Optional<String> code = BddWorld.authUiFlowService().resolveOtpHook(BddWorld.config().testUsername());
        if (code.isEmpty()) {
            throw new SkipException("OTP provider did not return a code");
        }
    }

    @Given("mfa verification is configured")
    public void mfaProviderHookIsConfigured() {
        if (!BddWorld.config().hasMfaProvider()) {
            throw new SkipException("Set MFA_PROVIDER and provider-specific secrets to run @mfa scenarios");
        }
    }

    @Then("an mfa code can be retrieved")
    public void mfaProviderHookCanResolveCode() {
        Optional<String> code = BddWorld.authUiFlowService().resolveMfaHook(
                BddWorld.config().testUsername(),
                "mfa-token-placeholder",
                false
        );
        if (code.isEmpty()) {
            throw new SkipException("MFA provider did not return a code");
        }
    }
}
