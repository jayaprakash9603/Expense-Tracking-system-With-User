package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * Feign client for Budget Service (port 6005)
 */
@FeignClient(name = "BUDGET-SERVICE", url = "http://localhost:6005")
public interface BudgetService {

    /**
     * Get all budgets for the user
     */
    @GetMapping("/api/budgets")
    List<Map<String, Object>> getAllBudgets(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "targetId", required = false) Integer targetId);

    /**
     * Get budget by ID
     */
    @GetMapping("/api/budgets/{budgetId}")
    Map<String, Object> getBudgetById(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "budgetId") Integer budgetId,
            @RequestParam(value = "targetId", required = false) Integer targetId);
}
