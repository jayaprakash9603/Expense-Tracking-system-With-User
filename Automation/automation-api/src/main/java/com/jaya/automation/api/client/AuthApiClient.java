package com.jaya.automation.api.client;

import com.jaya.automation.api.config.ApiSpecifications;
import com.jaya.automation.api.model.AuthSigninRequest;
import com.jaya.automation.api.model.AuthSigninResponse;
import com.jaya.automation.api.model.MfaVerifyRequest;
import com.jaya.automation.api.model.VerifyLoginOtpRequest;
import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import static io.restassured.RestAssured.given;

public final class AuthApiClient {
    private final RequestSpecification requestSpecification;

    public AuthApiClient(AutomationConfig automationConfig) {
        this.requestSpecification = new ApiSpecifications(automationConfig).requestSpec();
    }

    public Response signInRaw(AuthSigninRequest request) {
        return given()
                .spec(requestSpecification)
                .body(request)
                .when()
                .post("/auth/signin");
    }

    public AuthSigninResponse signIn(AuthSigninRequest request) {
        return signInRaw(request).as(AuthSigninResponse.class);
    }

    public AuthSigninResponse verifyLoginOtp(VerifyLoginOtpRequest request) {
        return given()
                .spec(requestSpecification)
                .body(request)
                .when()
                .post("/auth/verify-login-otp")
                .as(AuthSigninResponse.class);
    }

    public AuthSigninResponse verifyMfa(MfaVerifyRequest request) {
        return given()
                .spec(requestSpecification)
                .body(request)
                .when()
                .post("/auth/mfa/verify")
                .as(AuthSigninResponse.class);
    }
}
