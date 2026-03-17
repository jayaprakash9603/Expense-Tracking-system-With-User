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

import static org.assertj.core.api.Assertions.assertThat;

public class BillApiSteps extends StepDataSupport {

    @When("the user creates a bill with items")
    public void userCreatesBillWithItems(DataTable dataTable) {
        Map<String, Object> payload = objectMap(dataTable);
        ApiRequest request = ApiRequestBuilder.forEndpoint("bills.create").body(payload).build();
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, BddWorld.jwtToken());
        BddWorld.setApiExecutionResult(result);
        BddWorld.putAliasValue("createdBillId", result.jsonPathValue("id").orElse(null));
    }

    @Then("the bill should have {int} items")
    public void billShouldHaveItems(int expectedCount) {
        BddWorld.apiResponseValidator().assertJsonArraySize(
                BddWorld.apiExecutionResult(), "items", expectedCount);
    }

    @Then("the bill total should be greater than {double}")
    public void billTotalShouldBeGreaterThan(double minAmount) {
        Object total = BddWorld.apiExecutionResult().jsonPathValue("totalAmount")
                .orElseThrow(() -> new AssertionError("totalAmount not found in response"));
        assertThat(Double.parseDouble(total.toString())).isGreaterThan(minAmount);
    }
}
