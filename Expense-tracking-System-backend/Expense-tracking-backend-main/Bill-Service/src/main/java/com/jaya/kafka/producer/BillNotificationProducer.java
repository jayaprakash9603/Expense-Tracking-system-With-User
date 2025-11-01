package com.jaya.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.BillNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

/**
 * Concrete Kafka Producer for Bill Notification Events
 * Extends NotificationEventProducer to handle bill-specific events
 * 
 * Responsibilities:
 * - Configure topic name for bill events
 * - Implement custom validation for bill events
 * - Implement partitioning strategy (by userId)
 * - Add bill-specific logging
 */
@Component
@Slf4j
public class BillNotificationProducer extends NotificationEventProducer<BillNotificationEvent> {

    @Value("${kafka.topics.bill-events:bill-events}")
    private String billEventsTopic;

    public BillNotificationProducer(KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
    }

    @Override
    protected String getTopicName() {
        return billEventsTopic;
    }

    @Override
    protected String getEventTypeName() {
        return "Bill";
    }

    @Override
    protected void validateEvent(BillNotificationEvent event) {
        super.validateEvent(event);

        if (event.getUserId() == null) {
            throw new IllegalArgumentException("Bill event must have a userId");
        }

        if (event.getAction() == null || event.getAction().isEmpty()) {
            throw new IllegalArgumentException("Bill event must have an action");
        }

        if (event.getTimestamp() == null) {
            throw new IllegalArgumentException("Bill event must have a timestamp");
        }
    }

    @Override
    protected String generatePartitionKey(BillNotificationEvent event) {
        // Partition by userId to maintain event ordering per user
        return event.getUserId().toString();
    }

    @Override
    protected void beforeSend(BillNotificationEvent event) {
        log.debug("Preparing to send bill event: action={}, billId={}, userId={}",
                event.getAction(), event.getBillId(), event.getUserId());
    }

    @Override
    protected void afterSendSuccess(BillNotificationEvent event, SendResult<String, Object> result) {
        log.info("Bill notification sent successfully: action={}, billId={}, userId={}, partition={}",
                event.getAction(),
                event.getBillId(),
                event.getUserId(),
                result.getRecordMetadata().partition());
    }

    @Override
    protected void afterSendFailure(BillNotificationEvent event, Throwable exception) {
        log.error("Failed to send bill notification: action={}, billId={}, userId={}, error={}",
                event.getAction(),
                event.getBillId(),
                event.getUserId(),
                exception.getMessage());
    }
}
