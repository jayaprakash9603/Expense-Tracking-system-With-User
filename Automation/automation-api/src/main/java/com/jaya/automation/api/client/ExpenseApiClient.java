package com.jaya.automation.api.client;

import com.jaya.automation.core.config.AutomationConfig;
import io.restassured.response.Response;

import java.util.Map;

import static io.restassured.RestAssured.given;

public final class ExpenseApiClient extends AuthorizedApiClient {
    public ExpenseApiClient(AutomationConfig automationConfig) {
        super(automationConfig);
    }

    public Response createExpense(String jwtToken, Map<String, Object> payload) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .body(payload)
                .when()
                .post("/api/expenses");
    }

    public Response listExpenses(String jwtToken) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .when()
                .get("/api/expenses");
    }

    public Response deleteExpense(String jwtToken, String expenseId) {
        return given()
                .spec(requestSpecification)
                .header("Authorization", bearer(jwtToken))
                .when()
                .delete("/api/expenses/{expenseId}", expenseId);
    }
}
