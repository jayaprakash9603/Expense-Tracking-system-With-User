package com.jaya.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.FriendshipNotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

/**
 * FriendshipNotificationProducer
 * Concrete implementation for sending friendship notification events to Kafka
 * Extends NotificationEventProducer following Template Method Pattern
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles friendship notification production
 * - Open/Closed: Extends base producer without modifying it
 * - Liskov Substitution: Can replace
 * NotificationEventProducer<FriendshipNotificationEvent>
 * - Dependency Inversion: Depends on KafkaTemplate abstraction
 * 
 * DRY Principle:
 * - Reuses all common Kafka logic from NotificationEventProducer
 * - Only implements friendship-specific behavior
 * 
 * @author Friendship Service Team
 */
@Slf4j
@Component
public class FriendshipNotificationProducer extends NotificationEventProducer<FriendshipNotificationEvent> {

    @Value("${kafka.topics.friendship-events:friendship-events}")
    private String topicName;

    public FriendshipNotificationProducer(KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
        log.info("FriendshipNotificationProducer initialized");
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Friendship";
    }

    /**
     * Partition by userId to maintain event ordering per user
     * This ensures all notifications for a specific user are processed in order
     */
    @Override
    protected String generatePartitionKey(FriendshipNotificationEvent event) {
        return event.getUserId() != null ? event.getUserId().toString() : null;
    }

    /**
     * Custom validation for friendship events
     */
    @Override
    protected void validateEvent(FriendshipNotificationEvent event) {
        super.validateEvent(event);
        event.validate(); // Use event's own validation
    }

    /**
     * Log before sending with detailed context
     */
    @Override
    protected void beforeSend(FriendshipNotificationEvent event) {
        log.debug("Preparing to send friendship {} notification: User {} <- Actor {} (Friendship ID: {})",
                event.getAction(),
                event.getUserId(),
                event.getActorId(),
                event.getFriendshipId());
    }

    /**
     * Log success with details
     */
    @Override
    protected void afterSendSuccess(FriendshipNotificationEvent event, SendResult<String, Object> result) {
        log.info(
                "Friendship {} notification sent successfully: User {} notified about action by {} (Topic: {}, Partition: {})",
                event.getAction(),
                event.getUserId(),
                event.getActorName() != null ? event.getActorName() : event.getActorId(),
                result.getRecordMetadata().topic(),
                result.getRecordMetadata().partition());
    }

    /**
     * Log failure with details for troubleshooting
     */
    @Override
    protected void afterSendFailure(FriendshipNotificationEvent event, Throwable exception) {
        log.error("Failed to send friendship {} notification for user {} (Friendship ID: {}, Actor: {}): {}",
                event.getAction(),
                event.getUserId(),
                event.getFriendshipId(),
                event.getActorId(),
                exception.getMessage());
    }
}
