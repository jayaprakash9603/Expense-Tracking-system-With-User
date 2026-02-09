package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "BUDGET-SERVICE", url = "${BUDGET_SERVICE_URL:http://localhost:8080}")
public interface BudgetAnalyticsClient {

    @GetMapping("/api/budgets/reports")
    List<Map<String, Object>> getAllBudgetReportsForUser(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "targetId", required = false) Integer targetId);
            
}
