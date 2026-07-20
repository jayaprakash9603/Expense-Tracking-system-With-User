package com.jaya.common.service.client.feign;

import com.jaya.common.dto.BudgetDTO;
import com.jaya.common.service.client.IBudgetServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
    name = "BUDGET-SERVICE",
    url = "${BUDGET_SERVICE_URL:http://localhost:6005}",
    contextId = "commonBudgetServiceClient"
)
@Profile("!monolithic")
public interface FeignBudgetServiceClient extends IBudgetServiceClient {

    @Override
    @GetMapping("/api/budgets/internal/get-by-id")
    BudgetDTO getBudgetById(@RequestParam("budgetId") Integer budgetId,
                            @RequestParam("userId") Integer userId);

    @Override
    @PostMapping("/api/budgets/internal/save")
    BudgetDTO save(@RequestBody BudgetDTO budget);

    @Override
    @GetMapping("/api/budgets/internal/user")
    List<BudgetDTO> getAllBudgetForUser(@RequestParam("userId") Integer userId);
}
