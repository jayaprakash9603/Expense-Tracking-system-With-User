package com.jaya.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.CategoryNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka producer for Category notification events
 * Extends the base NotificationEventProducer with category-specific logic
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Only handles category event production
 * - Open/Closed: Extends base class without modifying it
 * - Liskov Substitution: Can be used anywhere NotificationEventProducer is
 * expected
 * - Interface Segregation: Only exposes necessary methods
 * - Dependency Inversion: Depends on abstractions (KafkaTemplate, ObjectMapper)
 */
@Slf4j
@Component
public class CategoryNotificationProducer extends NotificationEventProducer<CategoryNotificationEvent> {

    @Value("${kafka.topics.category-events:category-events}")
    private String topicName;

    public CategoryNotificationProducer(
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
        return "Category";
    }

    @Override
    protected void validateEvent(CategoryNotificationEvent event) {
        super.validateEvent(event);

        // Additional category-specific validation
        if (event.getUserId() == null) {
            throw new IllegalArgumentException("User ID cannot be null for category event");
        }

        if (event.getAction() == null || event.getAction().trim().isEmpty()) {
            throw new IllegalArgumentException("Action cannot be null or empty for category event");
        }

        if (event.getTimestamp() == null) {
            throw new IllegalArgumentException("Timestamp cannot be null for category event");
        }
    }

    @Override
    protected String generatePartitionKey(CategoryNotificationEvent event) {
        // Partition by userId to ensure all events for a user go to same partition
        // This maintains event ordering per user
        return "user-" + event.getUserId();
    }

    @Override
    protected void beforeSend(CategoryNotificationEvent event) {
        super.beforeSend(event);
        log.debug("Preparing to send category {} event for user {} - categoryId: {}, name: {}",
                event.getAction(), event.getUserId(), event.getCategoryId(), event.getCategoryName());
    }
}
