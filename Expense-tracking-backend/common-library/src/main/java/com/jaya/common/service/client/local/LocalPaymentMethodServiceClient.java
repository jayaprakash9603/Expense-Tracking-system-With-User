package com.jaya.common.service.client.local;

import com.jaya.common.dto.PaymentMethodDTO;
import com.jaya.common.service.client.IPaymentMethodServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Local implementation for Payment Method Service client in monolithic mode.
 * Calls the local PaymentMethodService bean directly instead of making HTTP calls.
 */
@Component
@Profile("monolithic")
@Slf4j
public class LocalPaymentMethodServiceClient implements IPaymentMethodServiceClient {

    private final ApplicationContext applicationContext;
    private Object paymentMethodService;

    @Autowired
    public LocalPaymentMethodServiceClient(@Lazy ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    private Object getPaymentMethodService() {
        if (paymentMethodService == null) {
            try {
                paymentMethodService = applicationContext.getBean("paymentMethodServiceImpl");
            } catch (Exception e) {
                log.warn("Could not find paymentMethodServiceImpl, trying PaymentMethodServiceImpl class", e);
                try {
                    paymentMethodService = applicationContext.getBean(
                        Class.forName("com.jaya.service.PaymentMethodServiceImpl"));
                } catch (ClassNotFoundException ex) {
                    log.error("PaymentMethodServiceImpl class not found", ex);
                    throw new RuntimeException("PaymentMethodService not available in monolithic mode", ex);
                }
            }
        }
        return paymentMethodService;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<PaymentMethodDTO> getAllPaymentMethods(Integer userId) {
        log.debug("LocalPaymentMethodServiceClient: Getting all payment methods for user: {}", userId);
        try {
            Object service = getPaymentMethodService();
            var method = service.getClass().getMethod("getAllPaymentMethods", Integer.class);
            return (List<PaymentMethodDTO>) method.invoke(service, userId);
        } catch (Exception e) {
            log.error("Error calling local PaymentMethodService.getAllPaymentMethods", e);
            throw new RuntimeException("Failed to get all payment methods locally", e);
        }
    }

    @Override
    public PaymentMethodDTO save(PaymentMethodDTO paymentMethod) {
        log.debug("LocalPaymentMethodServiceClient: Saving payment method");
        try {
            Object service = getPaymentMethodService();
            var method = service.getClass().getMethod("save", PaymentMethodDTO.class);
            return (PaymentMethodDTO) method.invoke(service, paymentMethod);
        } catch (Exception e) {
            log.error("Error calling local PaymentMethodService.save", e);
            throw new RuntimeException("Failed to save payment method locally", e);
        }
    }

    @Override
    public PaymentMethodDTO getByNameAndType(Integer userId, String name, String type) {
        log.debug("LocalPaymentMethodServiceClient: Getting payment method by name: {} and type: {}", name, type);
        try {
            Object service = getPaymentMethodService();
            var method = service.getClass().getMethod(
                "getByNameAndType", Integer.class, String.class, String.class);
            return (PaymentMethodDTO) method.invoke(service, userId, name, type);
        } catch (Exception e) {
            log.error("Error calling local PaymentMethodService.getByNameAndType", e);
            throw new RuntimeException("Failed to get payment method by name and type locally", e);
        }
    }

    @Override
    public PaymentMethodDTO getByName(Integer userId, String name) {
        log.debug("LocalPaymentMethodServiceClient: Getting payment method by name: {}", name);
        try {
            Object service = getPaymentMethodService();
            var method = service.getClass().getMethod("getByName", Integer.class, String.class);
            return (PaymentMethodDTO) method.invoke(service, userId, name);
        } catch (Exception e) {
            log.error("Error calling local PaymentMethodService.getByName", e);
            throw new RuntimeException("Failed to get payment method by name locally", e);
        }
    }
}
