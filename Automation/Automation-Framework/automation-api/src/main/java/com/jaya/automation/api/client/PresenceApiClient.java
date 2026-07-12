package com.jaya.automation.api.client;

import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;

import java.util.Map;

import static io.restassured.RestAssured.given;

public final class PresenceApiClient extends AuthorizedApiClient {
    public PresenceApiClient(AutomationConfig automationConfig) {
        super(automationConfig);
    }

    public Response updatePresence(String jwtToken, Map<String, Object> payload) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .body(payload)
                .when()
                .post("/api/presence");
    }

    public Response fetchPresence(String jwtToken, String userId) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .when()
                .get("/api/presence/{userId}", userId);
    }
}
