package com.jaya.automation.api.client;

import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;

import java.util.Map;

import static io.restassured.RestAssured.given;

public final class GroupApiClient extends AuthorizedApiClient {
    public GroupApiClient(AutomationConfig automationConfig) {
        super(automationConfig);
    }

    public Response createGroup(String jwtToken, Map<String, Object> payload) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .body(payload)
                .when()
                .post("/api/groups");
    }

    public Response listGroups(String jwtToken) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .when()
                .get("/api/groups");
    }
}
