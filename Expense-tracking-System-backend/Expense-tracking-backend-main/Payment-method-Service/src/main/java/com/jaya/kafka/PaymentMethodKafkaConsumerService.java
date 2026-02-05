package com.jaya.kafka;

import com.jaya.dto.PaymentMethodEvent;
import com.jaya.models.PaymentMethod;
import com.jaya.repository.PaymentMethodRepository;
import com.jaya.service.PaymentMethodService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

@Service
public class PaymentMethodKafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentMethodKafkaConsumerService.class);

    @Autowired
    private PaymentMethodService paymentMethodService;

    @Autowired
    private PaymentMethodRepository paymentMethodRepository;

    @KafkaListener(
            topics = "payment-method-events",
            groupId = "payment-method-group",
            containerFactory = "objectKafkaListenerContainerFactory"
    )
    @Transactional
    public void handlePaymentMethodEvent(PaymentMethodEvent event) {
        try {
            logger.info("Received payment method event for user: {} and payment method: {}",
                    event.getUserId(), event.getPaymentMethodName());

            switch (event.getEventType()) {
                case "CREATE":
                    handleCreatePaymentMethod(event);
                    break;
                case "UPDATE":
                    handleUpdatePaymentMethod(event);
                    break;
                case "DELETE":
                    handleDeletePaymentMethod(event);
                    break;
                default:
                    logger.warn("Unknown event type: {}", event.getEventType());
            }
        } catch (Exception e) {
            logger.error("Error processing payment method event: {}", e.getMessage(), e);
        }
    }

    private void handleCreatePaymentMethod(PaymentMethodEvent event) {
        PaymentMethod paymentMethod = paymentMethodService.getAllPaymentMethods(event.getUserId())
                .stream()
                .filter(pm -> pm.getName().equalsIgnoreCase(event.getPaymentMethodName()) &&
                        pm.getType().equalsIgnoreCase(event.getPaymentType()))
                .findFirst()
                .orElse(null);

        if (paymentMethod == null) {
            paymentMethod = new PaymentMethod();
            paymentMethod.setUserId(event.getUserId());
            paymentMethod.setName(event.getPaymentMethodName());
            paymentMethod.setType(event.getPaymentType());
            paymentMethod.setAmount(0);
            paymentMethod.setGlobal(false);
            paymentMethod.setDescription(event.getDescription());
            paymentMethod.setIcon(event.getIcon());
            paymentMethod.setColor(event.getColor());
            paymentMethod.setExpenseIds(new HashMap<>());
        }

        if (paymentMethod.getExpenseIds() == null) {
            paymentMethod.setExpenseIds(new HashMap<>());
        }

        Set<Integer> userExpenseSet = paymentMethod.getExpenseIds()
                .getOrDefault(event.getUserId(), new HashSet<>());
        userExpenseSet.add(event.getExpenseId());
        paymentMethod.getExpenseIds().put(event.getUserId(), userExpenseSet);

        paymentMethodRepository.save(paymentMethod);
        logger.info("Payment method created/updated successfully for user: {}", event.getUserId());
    }

    private void handleUpdatePaymentMethod(PaymentMethodEvent event) {
        
        handleCreatePaymentMethod(event); 
    }

    private void handleDeletePaymentMethod(PaymentMethodEvent event) {
        PaymentMethod paymentMethod = paymentMethodService.getAllPaymentMethods(event.getUserId())
                .stream()
                .filter(pm -> pm.getName().equalsIgnoreCase(event.getPaymentMethodName()) &&
                        pm.getType().equalsIgnoreCase(event.getPaymentType()))
                .findFirst()
                .orElse(null);

        if (paymentMethod != null && paymentMethod.getExpenseIds() != null) {
            Set<Integer> userExpenseSet = paymentMethod.getExpenseIds()
                    .getOrDefault(event.getUserId(), new HashSet<>());
            userExpenseSet.remove(event.getExpenseId());

            if (userExpenseSet.isEmpty()) {
                paymentMethod.getExpenseIds().remove(event.getUserId());
            } else {
                paymentMethod.getExpenseIds().put(event.getUserId(), userExpenseSet);
            }

            paymentMethodRepository.save(paymentMethod);
            logger.info("Payment method updated for deletion for user: {}", event.getUserId());
        }
    }
}