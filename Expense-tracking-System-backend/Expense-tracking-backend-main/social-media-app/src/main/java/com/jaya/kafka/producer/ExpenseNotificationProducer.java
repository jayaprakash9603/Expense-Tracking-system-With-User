package com.jaya.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.ExpenseNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka producer for Expense notification events
 * Extends the base NotificationEventProducer with expense-specific logic
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Only handles expense event production
 * - Open/Closed: Extends base class without modifying it
 * - Liskov Substitution: Can be used anywhere NotificationEventProducer is
 * expected
 * - Interface Segregation: Only exposes necessary methods
 * - Dependency Inversion: Depends on abstractions (KafkaTemplate, ObjectMapper)
 */
@Slf4j
@Component
public class ExpenseNotificationProducer extends NotificationEventProducer<ExpenseNotificationEvent> {

    @Value("${kafka.topics.expense-events:expense-events}")
    private String topicName;

    public ExpenseNotificationProducer(
            KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Expense";
    }

    @Override
    protected void validateEvent(ExpenseNotificationEvent event) {
        super.validateEvent(event);

        // Additional expense-specific validation
        if (event.getUserId() == null) {
            throw new IllegalArgumentException("User ID cannot be null for expense event");
        }

        if (event.getAction() == null || event.getAction().trim().isEmpty()) {
            throw new IllegalArgumentException("Action cannot be null or empty for expense event");
        }

        if (event.getTimestamp() == null) {
            throw new IllegalArgumentException("Timestamp cannot be null for expense event");
        }
    }

    @Override
    protected String generatePartitionKey(ExpenseNotificationEvent event) {
        // Partition by userId to ensure all events for a user go to same partition
        // This maintains event ordering per user
        return "user-" + event.getUserId();
    }

    @Override
    protected void beforeSend(ExpenseNotificationEvent event) {
        super.beforeSend(event);
        log.debug("Preparing to send expense {} event for user {} - expenseId: {}, amount: {}",
                event.getAction(), event.getUserId(), event.getExpenseId(), event.getAmount());
    }
}
