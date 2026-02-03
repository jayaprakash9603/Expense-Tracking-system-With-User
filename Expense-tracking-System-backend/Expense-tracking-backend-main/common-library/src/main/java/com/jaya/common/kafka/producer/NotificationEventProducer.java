package com.jaya.common.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.concurrent.CompletableFuture;

/**
 * Abstract base class for Kafka notification event producers.
 * All services should extend this class for their Kafka producers.
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Only handles Kafka message publishing
 * - Open/Closed: Open for extension (subclasses), closed for modification
 * - Liskov Substitution: Any subclass can be used in place of this base class
 * - Dependency Inversion: Depends on abstractions (KafkaTemplate)
 *
 * Usage:
 * 
 * <pre>
 * &#64;Component
 * public class ExpenseNotificationProducer extends NotificationEventProducer<ExpenseNotificationEvent> {
 * 
 *     &#64;Value("${kafka.topics.expense-events:expense-events}")
 *     private String topicName;
 * 
 *     &#64;Override
 *     protected String getTopicName() {
 *         return topicName;
 *     }
 * 
 *     &#64;Override
 *     protected String getEventTypeName() {
 *         return "Expense Notification";
 *     }
 * 
 *     @Override
 *     protected String generatePartitionKey(ExpenseNotificationEvent event) {
 *         return event.getUserId().toString(); // Partition by user for ordering
 *     }
 * }
 * </pre>
 *
 * @param <T> The type of event DTO being produced
 */
@Slf4j
@RequiredArgsConstructor
public abstract class NotificationEventProducer<T> {

    protected final KafkaTemplate<String, Object> kafkaTemplate;
    protected final ObjectMapper objectMapper;

    /**
     * Get the Kafka topic name for this producer.
     * Template Method Pattern - subclasses must implement.
     */
    protected abstract String getTopicName();

    /**
     * Get a descriptive name for this event type (for logging).
     */
    protected abstract String getEventTypeName();

    /**
     * Validate the event before sending.
     * Can be overridden by subclasses for specific validation logic.
     */
    protected void validateEvent(T event) {
        if (event == null) {
            throw new IllegalArgumentException(getEventTypeName() + " event cannot be null");
        }
    }

    /**
     * Generate a partition key for the message.
     * Default implementation uses a fixed key (all messages to same partition).
     * Override this method for custom partitioning strategy.
     * 
     * Best Practice: Partition by user ID to ensure message ordering per user.
     */
    protected String generatePartitionKey(T event) {
        return getTopicName() + "-key";
    }

    /**
     * Hook method called before sending the event.
     * Can be overridden for pre-send processing.
     */
    protected void beforeSend(T event) {
        log.debug("Preparing to send {} event", getEventTypeName());
    }

    /**
     * Hook method called after successful send.
     * Can be overridden for post-send processing.
     */
    protected void afterSendSuccess(T event, SendResult<String, Object> result) {
        log.info("Successfully sent {} event to topic '{}' partition {} offset {}",
                getEventTypeName(),
                result.getRecordMetadata().topic(),
                result.getRecordMetadata().partition(),
                result.getRecordMetadata().offset());
    }

    /**
     * Hook method called after send failure.
     * Can be overridden for custom error handling.
     */
    protected void afterSendFailure(T event, Throwable ex) {
        log.error("Failed to send {} event to topic '{}': {}",
                getEventTypeName(), getTopicName(), ex.getMessage(), ex);
    }

    /**
     * Send event to Kafka topic asynchronously.
     * This is the main public API method.
     */
    public void sendEvent(T event) {
        try {
            // Validate
            validateEvent(event);

            // Pre-send hook
            beforeSend(event);

            // Generate key
            String key = generatePartitionKey(event);

            // Log event details in debug mode
            if (log.isDebugEnabled()) {
                try {
                    String eventJson = objectMapper.writeValueAsString(event);
                    log.debug("Sending {} event: {}", getEventTypeName(), eventJson);
                } catch (JsonProcessingException e) {
                    log.debug("Sending {} event (JSON serialization failed for logging)", getEventTypeName());
                }
            }

            // Send to Kafka
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                    getTopicName(),
                    key,
                    event);

            // Handle result asynchronously
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    afterSendFailure(event, ex);
                } else {
                    afterSendSuccess(event, result);
                }
            });

        } catch (Exception e) {
            log.error("Error while preparing to send {} event: {}", getEventTypeName(), e.getMessage(), e);
            throw new RuntimeException("Failed to send " + getEventTypeName() + " event", e);
        }
    }

    /**
     * Send event synchronously and wait for result.
     * Use this when you need to ensure the message is sent before proceeding.
     */
    public SendResult<String, Object> sendEventSync(T event) {
        try {
            validateEvent(event);
            beforeSend(event);

            String key = generatePartitionKey(event);

            log.info("Sending {} event synchronously to topic '{}'", getEventTypeName(), getTopicName());

            SendResult<String, Object> result = kafkaTemplate.send(
                    getTopicName(),
                    key,
                    event).get(); // Blocking call

            afterSendSuccess(event, result);
            return result;

        } catch (Exception e) {
            afterSendFailure(event, e);
            throw new RuntimeException("Failed to send " + getEventTypeName() + " event synchronously", e);
        }
    }

    /**
     * Send event with custom partition key.
     */
    public void sendEvent(T event, String partitionKey) {
        try {
            validateEvent(event);
            beforeSend(event);

            log.debug("Sending {} event with custom key '{}' to topic '{}'",
                    getEventTypeName(), partitionKey, getTopicName());

            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                    getTopicName(),
                    partitionKey,
                    event);

            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    afterSendFailure(event, ex);
                } else {
                    afterSendSuccess(event, result);
                }
            });

        } catch (Exception e) {
            log.error("Error while sending {} event with custom key: {}", getEventTypeName(), e.getMessage(), e);
            throw new RuntimeException("Failed to send " + getEventTypeName() + " event", e);
        }
    }
}
