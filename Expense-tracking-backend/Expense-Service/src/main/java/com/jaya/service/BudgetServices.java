package com.jaya.service;


import com.jaya.models.Budget;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "BUDGET-SERVICE", url = "${budget.service.url:http://localhost:6005}")
public interface BudgetServices {


    @GetMapping("/api/budgets/get-by-id")
    public Budget getBudgetById(
            @RequestParam Integer budgetId,
            @RequestParam Integer userId
    ) throws Exception;

    @PostMapping("/api/budgets/save")
    public Budget save(
            @RequestBody Budget budget
    ) throws Exception;

    @GetMapping("/api/budgets/user")
    public List<Budget> getAllBudgetForUser(
            @RequestParam Integer userId
    ) throws Exception;

}
