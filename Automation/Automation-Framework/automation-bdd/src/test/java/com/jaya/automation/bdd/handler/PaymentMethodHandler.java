package com.jaya.automation.bdd.handler;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.core.context.TestContext;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Handler for payment method API operations.
 */
@Component
public class PaymentMethodHandler extends BaseApiHandler {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(PaymentMethodHandler.class);

    public ApiExecutionResult createPaymentMethod(Map<String, Object> payload) {
        ApiRequest request = builder("payments.create").body(payload).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 201);

        storeAlias("payment.lastCreatedId", result, "id");
        LOG.info("Payment method created: status={}", result.statusCode());
        return result;
    }

    public ApiExecutionResult createPaymentMethodAndEnrich(Map<String, Object> payload, TestContext context) {
        ApiExecutionResult result = createPaymentMethod(payload);
        storeInContext(context, "paymentMethodId", result, "id");
        return result;
    }

    public ApiExecutionResult listPaymentMethods() {
        ApiRequest request = builder("payments.list").build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        return result;
    }

    public ApiExecutionResult deletePaymentMethod(String paymentMethodId) {
        ApiRequest request = builder("payments.delete").pathParam("id", paymentMethodId).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 204);
        return result;
    }
}
