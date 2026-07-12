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
import org.springframework.stereotype.Component;

@Component
public class CategoryApiSteps extends StepDataSupport {

    @When("the user creates a category and links expenses")
    public void userCreatesCategoryAndLinksExpenses(DataTable dataTable) {
        Map<String, Object> payload = objectMap(dataTable);
        ApiRequest request = ApiRequestBuilder.forEndpoint("categories.create").body(payload).build();
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, BddWorld.jwtToken());
        BddWorld.setApiExecutionResult(result);
        BddWorld.putAliasValue("createdCategoryId", result.jsonPathValue("id").orElse(null));
    }

    @Then("the category should have expenses linked")
    public void categoryShouldHaveExpensesLinked() {
        Object categoryId = BddWorld.aliasValue("createdCategoryId")
                .orElseThrow(() -> new AssertionError("No category ID stored"));
        ApiRequest request = ApiRequestBuilder.forEndpoint("categories.expenses")
                .pathParam("categoryId", categoryId.toString()).build();
        ApiExecutionResult result = BddWorld.apiRequestExecutor().execute(request, BddWorld.jwtToken());
        BddWorld.setApiExecutionResult(result);
    }
}
