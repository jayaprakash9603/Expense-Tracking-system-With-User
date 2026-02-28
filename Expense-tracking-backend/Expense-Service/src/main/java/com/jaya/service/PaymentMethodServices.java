package com.jaya.service;


import com.jaya.models.ExpensePaymentMethod;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "PAYMENT-SERVICE", url = "${payment.service.url:http://localhost:6006}", contextId = "expensePaymentClient")
public interface PaymentMethodServices {


    @GetMapping("/api/payment-methods/get-all-payment-methods")
    public List<ExpensePaymentMethod> getAllPaymentMethods(
            @RequestParam Integer userId);

    @PostMapping("/api/payment-methods/save")
    public ExpensePaymentMethod save(
            @RequestBody ExpensePaymentMethod paymentMethod
    );
    @GetMapping("/api/payment-methods/name-and-type")
    public ExpensePaymentMethod getByNameAndType(
            @RequestParam Integer userId,
            @RequestParam String name,
            @RequestParam String type);

    @GetMapping("/api/payment-methods/names")
    public ExpensePaymentMethod getByNameWithService(
            @RequestParam Integer userId,
            @RequestParam String name
    );
}

