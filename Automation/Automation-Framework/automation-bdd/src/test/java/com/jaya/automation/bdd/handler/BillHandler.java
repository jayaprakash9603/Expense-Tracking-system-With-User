package com.jaya.automation.bdd.handler;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.core.context.TestContext;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Handler for bill API operations with validation and context enrichment.
 */
@Component
public class BillHandler extends BaseApiHandler {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(BillHandler.class);

    public ApiExecutionResult createBill(Map<String, Object> payload) {
        ApiRequest request = builder("bill.create").body(payload).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 201);

        storeAlias("bill.lastCreatedId", result, "id");
        LOG.info("Bill created: status={}", result.statusCode());
        return result;
    }

    public ApiExecutionResult createBillAndEnrich(Map<String, Object> payload, TestContext context) {
        ApiExecutionResult result = createBill(payload);
        storeInContext(context, "billId", result, "id");
        return result;
    }

    public ApiExecutionResult listBills() {
        ApiRequest request = builder("bill.list").build();
        return executeWithRetry(request, 200);
    }

    public ApiExecutionResult getBill(String billId) {
        ApiRequest request = builder("bill.get").pathParam("id", billId).build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        return result;
    }

    public ApiExecutionResult updateBill(String billId, Map<String, Object> payload) {
        ApiRequest request = builder("bill.update").pathParam("id", billId).body(payload).build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        return result;
    }

    public ApiExecutionResult deleteBill(String billId) {
        ApiRequest request = builder("bill.delete").pathParam("id", billId).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 204);
        return result;
    }
}
