package com.jaya.automation.bdd.handler;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.core.context.TestContext;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Handler for budget API operations with status polling support.
 * Pattern reference: company ManageOrderHandler.checkOrderStatus()
 */
@Component
public class BudgetHandler extends BaseApiHandler {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(BudgetHandler.class);

    public ApiExecutionResult createBudget(Map<String, Object> payload) {
        ApiRequest request = builder("budget.create").body(payload).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 201);

        storeAlias("budget.lastCreatedId", result, "id");
        LOG.info("Budget created: status={}", result.statusCode());
        return result;
    }

    public ApiExecutionResult createBudgetAndEnrich(Map<String, Object> payload, TestContext context) {
        ApiExecutionResult result = createBudget(payload);
        storeInContext(context, "budgetId", result, "id");
        storeInContext(context, "budgetName", result, "name");
        return result;
    }

    public ApiExecutionResult listBudgets() {
        ApiRequest request = builder("budget.list").build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        return result;
    }

    public ApiExecutionResult getBudget(String budgetId) {
        ApiRequest request = builder("budget.get").pathParam("id", budgetId).build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        return result;
    }

    public ApiExecutionResult updateBudget(String budgetId, Map<String, Object> payload) {
        ApiRequest request = builder("budget.update").pathParam("id", budgetId).body(payload).build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        return result;
    }

    public ApiExecutionResult deleteBudget(String budgetId) {
        ApiRequest request = builder("budget.delete").pathParam("id", budgetId).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 204);
        return result;
    }

    /**
     * Poll budget status until it matches expected value.
     * Useful for budget threshold notification verification.
     */
    public ApiExecutionResult waitForBudgetStatus(String budgetId, String expectedStatus, int maxWaitSeconds) {
        ApiRequest request = builder("budget.get").pathParam("id", budgetId).build();
        return pollUntil(request, "status", expectedStatus, maxWaitSeconds);
    }
}
