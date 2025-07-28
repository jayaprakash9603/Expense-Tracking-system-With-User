package com.jaya.service;


import com.jaya.models.PaymentMethod;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "PAYMENT-SERVICE", url = "http://localhost:6006")
public interface PaymentMethodServices {


    @GetMapping("/api/payment-methods/get-all-payment-methods")
    public List<PaymentMethod> getAllPaymentMethods(
            @RequestParam Integer userId);

    @PostMapping("/api/payment-methods/save")
    public PaymentMethod save(
            @RequestBody PaymentMethod paymentMethod
    );
    @GetMapping("/api/payment-methods/name-and-type")
    public PaymentMethod getByNameAndType(
            @RequestParam Integer userId,
            @RequestParam String name,
            @RequestParam String type);

    @GetMapping("/api/payment-methods/names")
    public PaymentMethod getByNameWithService(
            @RequestParam Integer userId,
            @RequestParam String name
    );
}
