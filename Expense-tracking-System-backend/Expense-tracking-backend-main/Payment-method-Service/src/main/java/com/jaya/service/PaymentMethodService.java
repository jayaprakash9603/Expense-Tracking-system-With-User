package com.jaya.service;


import com.jaya.models.PaymentMethod;

import java.util.List;

public interface PaymentMethodService {
    PaymentMethod getById(Integer userId, Integer id) throws Exception;


    PaymentMethod save(PaymentMethod paymentMethod);
    List<PaymentMethod> getAllPaymentMethods(Integer userId);

    PaymentMethod createPaymentMethod(Integer userId, PaymentMethod paymentMethod) throws Exception;

    PaymentMethod findOrCreatePaymentMethod(Integer userId, String paymentMethodName) throws Exception;

    PaymentMethod updatePaymentMethod(Integer userId, Integer id, PaymentMethod paymentMethod) throws Exception;

    void deletePaymentMethod(Integer userId, Integer paymentId) throws Exception;

    PaymentMethod getByName(Integer userId, String name);
    PaymentMethod getByName(Integer userId, String name, String type);

    PaymentMethod getByName(String name);

    public PaymentMethod getByNameAndTypeOrCreate(String name, String type);
    void deleteAllUserPaymentMethods(Integer userId);

    List<PaymentMethod> getOthersAndUnusedPaymentMethods(Integer userId);

}