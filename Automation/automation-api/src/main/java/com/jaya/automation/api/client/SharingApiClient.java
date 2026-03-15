package com.jaya.automation.api.client;

import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;

import java.util.Map;

import static io.restassured.RestAssured.given;

public final class SharingApiClient extends AuthorizedApiClient {
    public SharingApiClient(AutomationConfig automationConfig) {
        super(automationConfig);
    }

    public Response shareResource(String jwtToken, Map<String, Object> payload) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .body(payload)
                .when()
                .post("/api/sharing");
    }

    public Response listSharedResources(String jwtToken) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .when()
                .get("/api/sharing");
    }
}
