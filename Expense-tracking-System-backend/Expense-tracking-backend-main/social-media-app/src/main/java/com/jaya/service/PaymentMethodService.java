//package com.jaya.service;
//
//import com.jaya.exceptions.UserException;
//import com.jaya.models.PaymentMethod;
//import com.jaya.models.User;
//
//import java.util.List;
//
//public interface PaymentMethodService {
//    PaymentMethod getById(Integer userId, Integer id) throws Exception;
//
//    List<PaymentMethod> getAllPaymentMethods(Integer userId);
//
//    PaymentMethod createPaymentMethod(Integer userId, PaymentMethod paymentMethod) throws UserException;
//
//    PaymentMethod findOrCreatePaymentMethod(Integer userId, String paymentMethodName) throws UserException;
//
//    PaymentMethod updatePaymentMethod(Integer userId, Integer id, PaymentMethod paymentMethod) throws Exception;
//
//    void deletePaymentMethod(Integer userId, Integer paymentId) throws Exception;
//
//    PaymentMethod getByName(Integer userId, String name);
//    PaymentMethod getByName(Integer userId, String name,String type);
//
//    PaymentMethod getByName( String name);
//
//    public PaymentMethod getByNameAndTypeOrCreate(String name, String type);
//    void deleteAllUserPaymentMethods(Integer userId);
//
//    List<PaymentMethod> getOthersAndUnusedPaymentMethods(Integer userId);
//
//}