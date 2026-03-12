package com.jaya.automation.api.client;

import com.jaya.automation.api.model.UserProfileResponse;
import com.jaya.automation.core.config.AutomationConfig;

import java.util.Map;

import static io.restassured.RestAssured.given;

public final class UserProfileApiClient extends AuthorizedApiClient {

    public UserProfileApiClient(AutomationConfig automationConfig) {
        super(automationConfig);
    }

    public UserProfileResponse getProfile(String jwtToken) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .when()
                .get("/api/user/profile")
                .as(UserProfileResponse.class);
    }

    public Map<String, Object> updateTwoFactor(String jwtToken, boolean enabled) {
        Map<String, Object> payload = Map.of("enabled", enabled);
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .body(payload)
                .when()
                .put("/api/user/two-factor")
                .as(Map.class);
    }
}
