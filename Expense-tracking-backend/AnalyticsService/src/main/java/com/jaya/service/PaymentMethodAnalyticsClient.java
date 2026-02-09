package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "PAYMENT-SERVICE", url = "http://localhost:6006")
public interface PaymentMethodAnalyticsClient {

    @GetMapping("/api/payment-methods/{id}")
    Map<String, Object> getPaymentMethodById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable("id") Integer id,
            @RequestParam(value = "targetId", required = false) Integer targetId);
}
