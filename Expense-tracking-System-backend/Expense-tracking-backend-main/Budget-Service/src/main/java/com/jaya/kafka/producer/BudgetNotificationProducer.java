package com.jaya.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.BudgetNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

/**
 * BudgetNotificationProducer
 * Concrete implementation for sending budget notification events to Kafka
 * Extends NotificationEventProducer following Template Method Pattern
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles budget notification production
 * - Open/Closed: Extends base producer without modifying it
 * - Liskov Substitution: Can replace NotificationEventProducer<BudgetNotificationEvent>
 * - Dependency Inversion: Depends on KafkaTemplate abstraction
 * 
 * DRY Principle:
 * - Reuses all common Kafka logic from NotificationEventProducer
 * - Only implements budget-specific behavior
 */
@Slf4j
@Component
public class BudgetNotificationProducer extends NotificationEventProducer<BudgetNotificationEvent> {

    @Value("${kafka.topics.budget-events:budget-events}")
    private String topicName;

    public BudgetNotificationProducer(KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
        log.info("BudgetNotificationProducer initialized");
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Budget";
    }

    /**
     * Partition by userId to maintain event ordering per user
     */
    @Override
    protected String generatePartitionKey(BudgetNotificationEvent event) {
        return event.getUserId() != null ? event.getUserId().toString() : null;
    }

    /**
     * Custom validation for budget events
     */
    @Override
    protected void validateEvent(BudgetNotificationEvent event) {
        super.validateEvent(event);
        event.validate(); // Use event's own validation
    }

    /**
     * Log before sending
     */
    @Override
    protected void beforeSend(BudgetNotificationEvent event) {
        log.debug("Preparing to send budget {} notification for user {} (Budget ID: {})",
                event.getAction(),
                event.getUserId(),
                event.getBudgetId());
    }

    /**
     * Log success with details
     */
    @Override
    protected void afterSendSuccess(BudgetNotificationEvent event, SendResult<String, Object> result) {
        log.info("Budget {} notification sent successfully for user {} (Budget: {}, Topic: {}, Partition: {})",
                event.getAction(),
                event.getUserId(),
                event.getBudgetName(),
                result.getRecordMetadata().topic(),
                result.getRecordMetadata().partition());
    }

    /**
     * Log failure with details
     */
    @Override
    protected void afterSendFailure(BudgetNotificationEvent event, Throwable exception) {
        log.error("Failed to send budget {} notification for user {} (Budget ID: {}): {}",
                event.getAction(),
                event.getUserId(),
                event.getBudgetId(),
                exception.getMessage());
    }
}
