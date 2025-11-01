package com.jaya.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.concurrent.CompletableFuture;

/**
 * Abstract Base Class for Notification Event Producers
 * Implements Template Method Pattern and follows SOLID principles
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles Kafka message production
 * - Open/Closed: Open for extension (subclasses), closed for modification
 * - Liskov Substitution: Subclasses can be used interchangeably
 * - Interface Segregation: Focused interface for event production
 * - Dependency Inversion: Depends on KafkaTemplate abstraction
 * 
 * @param <T> Event type that extends Serializable
 */
@Slf4j
public abstract class NotificationEventProducer<T> {

    protected final KafkaTemplate<String, Object> kafkaTemplate;
    protected final ObjectMapper objectMapper;

    protected NotificationEventProducer(KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Template Method - defines the algorithm skeleton
     * Sends event asynchronously to Kafka
     * 
     * @param event Event to send
     */
    public void sendEvent(T event) {
        try {
            // Hook method - allow subclasses to validate
            validateEvent(event);

            // Hook method - get topic name from subclass
            String topic = getTopicName();

            // Hook method - generate partition key
            String key = generatePartitionKey(event);

            // Hook method - before send
            beforeSend(event);

            // Log event details
            logEventDetails(event);

            // Send to Kafka
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, event);

            // Handle success/failure asynchronously
            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    afterSendSuccess(event, result);
                    log.debug("Successfully sent {} event to topic {}",
                            getEventTypeName(), topic);
                } else {
                    afterSendFailure(event, ex);
                    log.error("Failed to send {} event to topic {}: {}",
                            getEventTypeName(), topic, ex.getMessage());
                }
            });

        } catch (Exception e) {
            log.error("Error preparing {} event: {}", getEventTypeName(), e.getMessage(), e);
            throw new RuntimeException("Failed to send notification event", e);
        }
    }

    /**
     * Send event synchronously (blocks until result)
     * Use sparingly - prefer async sendEvent()
     * 
     * @param event Event to send
     * @return SendResult
     */
    public SendResult<String, Object> sendEventSync(T event) {
        try {
            validateEvent(event);
            String topic = getTopicName();
            String key = generatePartitionKey(event);
            beforeSend(event);

            SendResult<String, Object> result = kafkaTemplate.send(topic, key, event).get();
            afterSendSuccess(event, result);
            log.info("Synchronously sent {} event to topic {}", getEventTypeName(), topic);
            return result;
        } catch (Exception e) {
            log.error("Failed to send {} event synchronously: {}",
                    getEventTypeName(), e.getMessage(), e);
            throw new RuntimeException("Failed to send notification event", e);
        }
    }

    // ========== Abstract Methods (must be implemented by subclasses) ==========

    /**
     * Get the Kafka topic name for this event type
     * 
     * @return Topic name
     */
    protected abstract String getTopicName();

    /**
     * Get the event type name for logging
     * 
     * @return Event type name (e.g., "Bill", "Expense", "Budget")
     */
    protected abstract String getEventTypeName();

    // ========== Hook Methods (optional overrides) ==========

    /**
     * Validate event before sending
     * Override to add custom validation
     * 
     * @param event Event to validate
     */
    protected void validateEvent(T event) {
        if (event == null) {
            throw new IllegalArgumentException("Event cannot be null");
        }
    }

    /**
     * Generate partition key for Kafka
     * Default: null (round-robin)
     * Override to implement custom partitioning
     * 
     * @param event Event
     * @return Partition key
     */
    protected String generatePartitionKey(T event) {
        return null; // Default: round-robin
    }

    /**
     * Hook called before sending event
     * Override to add pre-send logic
     * 
     * @param event Event
     */
    protected void beforeSend(T event) {
        // Default: no-op
    }

    /**
     * Hook called after successful send
     * Override to add post-send logic
     * 
     * @param event  Event
     * @param result Send result
     */
    protected void afterSendSuccess(T event, SendResult<String, Object> result) {
        // Default: no-op
    }

    /**
     * Hook called after failed send
     * Override to add error handling
     * 
     * @param event     Event
     * @param exception Exception
     */
    protected void afterSendFailure(T event, Throwable exception) {
        // Default: no-op
    }

    // ========== Helper Methods ==========

    /**
     * Log event details for debugging
     * 
     * @param event Event to log
     */
    private void logEventDetails(T event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            log.debug("{} event payload: {}", getEventTypeName(), json);
        } catch (JsonProcessingException e) {
            log.warn("Could not serialize {} event for logging", getEventTypeName());
        }
    }
}
