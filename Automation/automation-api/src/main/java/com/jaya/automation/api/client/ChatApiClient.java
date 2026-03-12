package com.jaya.automation.api.client;

import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;

import java.util.Map;

import static io.restassured.RestAssured.given;

public final class ChatApiClient extends AuthorizedApiClient {
    public ChatApiClient(AutomationConfig automationConfig) {
        super(automationConfig);
    }

    public Response listConversations(String jwtToken) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .when()
                .get("/api/chats");
    }

    public Response sendMessage(String jwtToken, String conversationId, Map<String, Object> payload) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .body(payload)
                .when()
                .post("/api/chats/{conversationId}/messages", conversationId);
    }
}
