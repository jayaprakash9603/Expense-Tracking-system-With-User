package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "EXPENSE-TRACKING-SYSTEM", url = "${EXPENSE_SERVICE_URL:http://localhost:6000}", contextId = "analyticsExpenseClient")
public interface ExpenseClient {

        @GetMapping("/api/expenses/summary-expenses")
        Map<String, Object> getExpenseSummary(
                        @RequestHeader("Authorization") String jwt,
                        @RequestParam(value = "targetId", required = false) Integer targetId);

        @GetMapping("/api/expenses/all-by-categories/detailed/filtered")
        Map<String, Object> getAllExpensesByCategoriesDetailed(
                        @RequestHeader("Authorization") String jwt,
                        @RequestParam(value = "fromDate", required = false) String fromDate,
                        @RequestParam(value = "toDate", required = false) String toDate,
                        @RequestParam(value = "flowType", required = false) String flowType,
                        @RequestParam(value = "targetId", required = false) Integer targetId);

        @GetMapping("/api/expenses/all-by-payment-method/detailed/filtered")
        Map<String, Object> getAllExpensesByPaymentMethodDetailed(
                        @RequestHeader("Authorization") String jwt,
                        @RequestParam(value = "fromDate", required = false) String fromDate,
                        @RequestParam(value = "toDate", required = false) String toDate,
                        @RequestParam(value = "flowType", required = false) String flowType,
                        @RequestParam(value = "targetId", required = false) Integer targetId);
}
