package com.jaya.automation.api.client;

import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;

import java.util.Map;

import static io.restassured.RestAssured.given;

public final class FriendshipApiClient extends AuthorizedApiClient {
    public FriendshipApiClient(AutomationConfig automationConfig) {
        super(automationConfig);
    }

    public Response listFriends(String jwtToken) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .when()
                .get("/api/friendships");
    }

    public Response sendFriendRequest(String jwtToken, Map<String, Object> payload) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .body(payload)
                .when()
                .post("/api/friendships/request");
    }
}
