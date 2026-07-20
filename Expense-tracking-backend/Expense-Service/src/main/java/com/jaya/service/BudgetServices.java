package com.jaya.service;


import com.jaya.models.BudgetModel;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "BudgetModel-SERVICE", url = "${BudgetModel.service.url:http://localhost:6005}", contextId = "expenseBudgetClient")
public interface BudgetServices {


    @GetMapping("/api/budgets/internal/get-by-id")
    public BudgetModel getBudgetById(
            @RequestParam Integer budgetId,
            @RequestParam Integer userId
    ) throws Exception;

    @PostMapping("/api/budgets/internal/save")
    public BudgetModel save(
            @RequestBody BudgetModel BudgetModel
    ) throws Exception;

    @GetMapping("/api/budgets/internal/user")
    public List<BudgetModel> getAllBudgetForUser(
            @RequestParam Integer userId
    ) throws Exception;

}
