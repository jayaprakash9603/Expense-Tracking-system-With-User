package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "CATEGORY-SERVICE", url = "http://localhost:6008")
public interface CategoryAnalyticsClient {

    @GetMapping("/api/categories/{categoryId}")
    Map<String, Object> getCategoryById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable("categoryId") Integer categoryId,
            @RequestParam(value = "targetId", required = false) Integer targetId);

    @GetMapping("/api/categories/{categoryId}/analytics")
    Map<String, Object> getCategoryAnalytics(
            @RequestHeader("Authorization") String jwt,
            @PathVariable("categoryId") Integer categoryId,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "targetId", required = false) Integer targetId);

    /**
     * Get expenses by category.
     * Returns ApiResponse wrapper: {"success": true, "data": [...expenses]}
     */
    @GetMapping("/api/categories/{categoryId}/expenses")
    Map<String, Object> getCategoryExpenses(
            @RequestHeader("Authorization") String jwt,
            @PathVariable("categoryId") Integer categoryId,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "targetId", required = false) Integer targetId);
}
