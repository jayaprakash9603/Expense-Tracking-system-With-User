package com.jaya.common.service.client;

import com.jaya.common.dto.PaymentMethodDTO;

import java.util.List;

/**
 * Interface for Payment Method Service client operations.
 * Implementations:
 * - FeignPaymentMethodServiceClient: @Profile("!monolithic") - calls remote PAYMENT-SERVICE
 * - LocalPaymentMethodServiceClient: @Profile("monolithic") - calls PaymentMethodService bean directly
 */
public interface IPaymentMethodServiceClient {

    /**
     * Get all payment methods for a user.
     *
     * @param userId the user ID
     * @return list of payment methods
     */
    List<PaymentMethodDTO> getAllPaymentMethods(Integer userId);

    /**
     * Save a payment method.
     *
     * @param paymentMethod the payment method to save
     * @return the saved payment method
     */
    PaymentMethodDTO save(PaymentMethodDTO paymentMethod);

    /**
     * Get payment method by name and type.
     *
     * @param userId the user ID
     * @param name the payment method name
     * @param type the payment method type
     * @return the payment method
     */
    PaymentMethodDTO getByNameAndType(Integer userId, String name, String type);

    /**
     * Get payment method by name.
     *
     * @param userId the user ID
     * @param name the payment method name
     * @return the payment method
     */
    PaymentMethodDTO getByName(Integer userId, String name);
}
