package com.jaya.kafka;

import com.jaya.dto.PaymentMethodEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class PaymentMethodKafkaProducerService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentMethodKafkaProducerService.class);
    private static final String PAYMENT_METHOD_TOPIC = "payment-method-events";

    @Autowired
    @Qualifier("objectKafkaTemplate")
    private KafkaTemplate<String, Object> kafkaTemplate;

    public void sendPaymentMethodEvent(PaymentMethodEvent event) {
        try {
            String key = event.getUserId() + "-" + event.getPaymentMethodName();
            kafkaTemplate.send(PAYMENT_METHOD_TOPIC, key, event);
            logger.info("Payment method event sent successfully for UserDTO: {} and payment method: {}",
                    event.getUserId(), event.getPaymentMethodName());
        } catch (Exception e) {
            logger.error("Error sending payment method event: {}", e.getMessage(), e);
        }
    }
}
