package com.jaya.service;

import com.jaya.dto.PaymentMethodSearchDTO;
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

    /**
     * Fuzzy search payment methods by name or type.
     * Includes both user-specific and global payment methods.
     * Supports partial text matching for typeahead/search functionality.
     * Optimized query - avoids N+1 problem by returning DTOs.
     * 
     * @param userId the user whose payment methods to search (plus global)
     * @param query  the search query (partial match supported)
     * @param limit  maximum number of results to return
     * @return List of PaymentMethodSearchDTO matching the search criteria
     */
    List<PaymentMethodSearchDTO> searchPaymentMethods(Integer userId, String query, int limit);

}