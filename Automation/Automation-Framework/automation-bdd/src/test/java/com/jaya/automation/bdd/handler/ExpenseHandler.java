package com.jaya.automation.bdd.handler;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.core.context.TestContext;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Handler for expense API operations with validation, retry,
 * and automatic context enrichment.
 * <p>
 * Pattern reference: company ManageOrderHandler — wraps API execution
 * with response validation and TestContext state management.
 */
@Component
public class ExpenseHandler extends BaseApiHandler {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(ExpenseHandler.class);

    public ApiExecutionResult createExpense(Map<String, Object> payload) {
        ApiRequest request = builder("expense.create").body(payload).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 201);

        storeAlias("expense.lastCreatedId", result, "id");
        storeAlias("expense.lastCreatedName", result, "description");
        LOG.info("Expense created: endpoint={}, status={}", result.endpointKey(), result.statusCode());
        return result;
    }

    public ApiExecutionResult createExpenseAndEnrich(Map<String, Object> payload, TestContext context) {
        ApiExecutionResult result = createExpense(payload);
        storeInContext(context, "expenseId", result, "id");
        storeInContext(context, "expenseDescription", result, "description");
        return result;
    }

    public ApiExecutionResult listExpenses() {
        ApiRequest request = builder("expense.list").build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        return result;
    }

    public ApiExecutionResult getExpense(String expenseId) {
        ApiRequest request = builder("expense.get").pathParam("id", expenseId).build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        return result;
    }

    public ApiExecutionResult updateExpense(String expenseId, Map<String, Object> payload) {
        ApiRequest request = builder("expense.update").pathParam("id", expenseId).body(payload).build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        LOG.info("Expense updated: id={}", expenseId);
        return result;
    }

    public ApiExecutionResult deleteExpense(String expenseId) {
        ApiRequest request = builder("expense.delete").pathParam("id", expenseId).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 204);
        LOG.info("Expense deleted: id={}", expenseId);
        return result;
    }

    /**
     * Retry-based creation for transient failures.
     */
    public ApiExecutionResult createExpenseWithRetry(Map<String, Object> payload) {
        ApiRequest request = builder("expense.create").body(payload).build();
        return executeWithRetry(request, 201);
    }
}
