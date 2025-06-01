package com.jaya.service;

import com.jaya.exceptions.UserException;
import com.jaya.models.PaymentMethod;

import java.util.List;

public interface PaymentMethodService {


    PaymentMethod getById(Integer userId,Integer id) throws Exception;
    List<PaymentMethod>getAllPaymentMethods(Integer userId);
    PaymentMethod createPaymentMethod(Integer userId,PaymentMethod paymentMethod) throws UserException;
    PaymentMethod updatePaymentMethod(Integer userId,Integer id, PaymentMethod paymentMethod) throws Exception;
    void deletePaymentMethod(Integer userId,Integer paymentId) throws Exception;


}
