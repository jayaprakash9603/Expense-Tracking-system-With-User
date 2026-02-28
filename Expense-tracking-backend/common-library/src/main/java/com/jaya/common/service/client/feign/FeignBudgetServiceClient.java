package com.jaya.common.service.client.feign;

import com.jaya.common.dto.BudgetDTO;
import com.jaya.common.service.client.IBudgetServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feign client implementation for Budget Service.
 * Active only in microservices mode (when 'monolithic' profile is NOT active).
 */
@FeignClient(
    name = "BUDGET-SERVICE",
    url = "${BUDGET_SERVICE_URL:http://localhost:6005}",
    contextId = "commonBudgetServiceClient"
)
@Profile("!monolithic")
public interface FeignBudgetServiceClient extends IBudgetServiceClient {

    @Override
    @GetMapping("/api/budget/get")
    BudgetDTO getBudgetById(@RequestParam("budgetId") Integer budgetId,
                            @RequestParam("userId") Integer userId);

    @Override
    @PostMapping("/api/budget/save")
    BudgetDTO save(@RequestBody BudgetDTO budget);

    @Override
    @GetMapping("/api/budget/all")
    List<BudgetDTO> getAllBudgetForUser(@RequestParam("userId") Integer userId);
}
