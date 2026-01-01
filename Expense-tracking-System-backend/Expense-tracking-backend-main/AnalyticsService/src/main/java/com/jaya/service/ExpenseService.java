package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "EXPENSE-TRACKING-SYSTEM", url = "http://localhost:6000")
public interface ExpenseService {

    @GetMapping("/api/expenses/summary-expenses")
    Map<String, Object> getExpenseSummary(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "targetId", required = false) Integer targetId);
}
