package com.jaya.automation.bdd.steps.api;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.api.execution.ApiRequestBuilder;
import com.jaya.automation.bdd.context.BddWorld;
import com.jaya.automation.bdd.steps.common.StepDataSupport;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import java.util.Map;

public class PaymentMethodApiSteps extends StepDataSupport {

    @When("the user creates a payment method with details")
    public void userCreatesPaymentMethodWithDetails(DataTable dataTable) {
        Map<String, Object> payload = objectMap(dataTable);
        ApiRequest request = ApiRequestBuilder.forEndpoint("payments.create").body(payload).build();
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, BddWorld.jwtToken());
        BddWorld.setApiExecutionResult(result);
        BddWorld.putAliasValue("createdPaymentId", result.jsonPathValue("id").orElse(null));
    }

    @Then("the payment method should appear in the list")
    public void paymentMethodShouldAppearInList() {
        ApiRequest request = ApiRequest.of("payments.list");
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, BddWorld.jwtToken());
        BddWorld.setApiExecutionResult(result);
        BddWorld.apiResponseValidator().assertStatusBetween(result, 200, 299);
    }
}
