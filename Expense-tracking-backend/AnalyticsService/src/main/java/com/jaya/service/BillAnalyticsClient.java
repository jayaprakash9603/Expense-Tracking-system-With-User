package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@FeignClient(name = "BILL-SERVICE", url = "${BILL_SERVICE_URL:http://localhost:6007}", contextId = "analyticsBillClient")
public interface BillAnalyticsClient {

    @GetMapping("/api/bills/{id}")
    Map<String, Object> getBillById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable("id") Integer id,
            @RequestParam(value = "targetId", required = false) Integer targetId);

    @GetMapping("/api/bills")
    List<Map<String, Object>> getBillsByDateRange(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "startDate", required = false) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) LocalDate endDate,
            @RequestParam(value = "targetId", required = false) Integer targetId);
}
