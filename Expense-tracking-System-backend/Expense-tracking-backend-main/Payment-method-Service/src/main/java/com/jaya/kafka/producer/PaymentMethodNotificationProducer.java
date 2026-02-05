package com.jaya.kafka.producer;

import com.jaya.dto.PaymentMethodEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;










@Component
public class PaymentMethodNotificationProducer {

    private static final Logger logger = LoggerFactory.getLogger(PaymentMethodNotificationProducer.class);

    @Value("${kafka.topics.payment-method-events:payment-method-events}")
    private String topicName;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    




    public void sendPaymentMethodCreatedNotification(Integer userId, String paymentMethodName,
            String paymentType, String description, String icon, String color) {
        PaymentMethodEvent event = new PaymentMethodEvent(
                userId, null, paymentMethodName, paymentType, description, icon, color, "CREATE", true);
        sendEvent(event);
        logger.info("Sent payment method CREATED notification for user: {} and payment method: {}",
                userId, paymentMethodName);
    }

    




    public void sendPaymentMethodUpdatedNotification(Integer userId, String paymentMethodName,
            String paymentType, String description, String icon, String color) {
        PaymentMethodEvent event = new PaymentMethodEvent(
                userId, null, paymentMethodName, paymentType, description, icon, color, "UPDATE", true);
        sendEvent(event);
        logger.info("Sent payment method UPDATED notification for user: {} and payment method: {}",
                userId, paymentMethodName);
    }

    




    public void sendPaymentMethodDeletedNotification(Integer userId, String paymentMethodName,
            String paymentType) {
        PaymentMethodEvent event = new PaymentMethodEvent(
                userId, null, paymentMethodName, paymentType, "Payment method deleted", null, null, "DELETE", true);
        sendEvent(event);
        logger.info("Sent payment method DELETED notification for user: {} and payment method: {}",
                userId, paymentMethodName);
    }

    private void sendEvent(PaymentMethodEvent event) {
        try {
            String key = event.getUserId() + "-" + event.getPaymentMethodName();
            kafkaTemplate.send(topicName, key, event);
        } catch (Exception e) {
            logger.error("Error sending payment method notification event: {}", e.getMessage(), e);
        }
    }
}
