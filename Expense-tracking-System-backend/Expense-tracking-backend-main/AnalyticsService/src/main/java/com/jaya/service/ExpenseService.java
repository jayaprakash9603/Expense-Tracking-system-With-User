package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "EXPENSE-TRACKING-SYSTEM", url = "http://localhost:6000")
public interface ExpenseService {

    @GetMapping("/api/expenses/summary-expenses")
    Map<String, Object> getExpenseSummary(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "targetId", required = false) Integer targetId);

    /**
     * Get all expenses grouped by categories with detailed information.
     * This endpoint returns complete expense data including category metadata,
     * payment method info, and budget associations.
     */
    @GetMapping("/api/expenses/all-by-categories/detailed/filtered")
    Map<String, Object> getAllExpensesByCategoriesDetailed(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "flowType", required = false) String flowType,
            @RequestParam(value = "targetId", required = false) Integer targetId);
}
