package com.jaya.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.UnifiedActivityEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

/**
 * Unified Activity Event Producer
 * 
 * Single producer for all activity events across the system.
 * This replaces multiple separate producers (AuditEventProducer,
 * NotificationEventProducer,
 * FriendActivityEventProducer) with a single unified producer.
 * 
 * Consumers:
 * - Notification-Service: Handles user notifications and friend activity
 * notifications
 * - Audit-Service: Handles audit logging
 * 
 * Benefits:
 * - Single Kafka message per action (vs 3 separate messages)
 * - Reduced network overhead
 * - Easier event correlation
 * - Consistent event structure across services
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UnifiedActivityEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.unified-activity-events:unified-activity-events}")
    private String topicName;

    @Value("${spring.application.name:unknown-service}")
    private String serviceName;

    @Value("${app.version:1.0.0}")
    private String serviceVersion;

    @Value("${spring.profiles.active:dev}")
    private String environment;

    /**
     * Send unified activity event to Kafka
     */
    public void sendEvent(UnifiedActivityEvent event) {
        try {
            // Enrich event with service metadata
            enrichEvent(event);

            // Validate event
            validateEvent(event);

            // Generate partition key (by target user for ordering per user)
            String key = generatePartitionKey(event);

            // Log event details
            logEventDetails(event);

            // Send to Kafka
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topicName, key, event);

            // Handle result asynchronously
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    handleSendFailure(event, ex);
                } else {
                    handleSendSuccess(event, result);
                }
            });

        } catch (Exception e) {
            log.error("Error while preparing unified activity event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send unified activity event", e);
        }
    }

    /**
     * Send event synchronously and wait for result
     */
    public SendResult<String, Object> sendEventSync(UnifiedActivityEvent event) {
        try {
            enrichEvent(event);
            validateEvent(event);

            String key = generatePartitionKey(event);
            logEventDetails(event);

            log.info("Sending unified activity event synchronously to topic '{}'", topicName);

            SendResult<String, Object> result = kafkaTemplate.send(topicName, key, event).get();
            handleSendSuccess(event, result);
            return result;

        } catch (Exception e) {
            handleSendFailure(event, e);
            throw new RuntimeException("Failed to send unified activity event synchronously", e);
        }
    }

    /**
     * Enrich event with service metadata
     */
    private void enrichEvent(UnifiedActivityEvent event) {
        if (event.getSourceService() == null) {
            event.setSourceService(serviceName);
        }
        if (event.getServiceVersion() == null) {
            event.setServiceVersion(serviceVersion);
        }
        if (event.getEnvironment() == null) {
            event.setEnvironment(environment);
        }

        // Calculate isOwnAction if not already set
        if (event.getActorUserId() != null && event.getTargetUserId() != null) {
            event.calculateIsOwnAction();
        }
    }

    /**
     * Validate event before sending
     */
    private void validateEvent(UnifiedActivityEvent event) {
        if (event == null) {
            throw new IllegalArgumentException("Event cannot be null");
        }
        if (event.getTargetUserId() == null) {
            throw new IllegalArgumentException("Target user ID is required");
        }
        if (event.getEntityType() == null) {
            throw new IllegalArgumentException("Entity type is required");
        }
        if (event.getAction() == null) {
            throw new IllegalArgumentException("Action is required");
        }
    }

    /**
     * Generate partition key - by target user ID to ensure ordering per user
     */
    private String generatePartitionKey(UnifiedActivityEvent event) {
        return event.getTargetUserId().toString();
    }

    /**
     * Log event details
     */
    private void logEventDetails(UnifiedActivityEvent event) {
        if (log.isDebugEnabled()) {
            try {
                String eventJson = objectMapper.writeValueAsString(event);
                log.debug("Sending unified activity event: {}", eventJson);
            } catch (JsonProcessingException e) {
                log.debug("Sending unified activity event (JSON serialization failed): eventId={}",
                        event.getEventId());
            }
        } else {
            log.info("Sending unified activity event: eventId={}, entityType={}, action={}, " +
                    "targetUserId={}, actorUserId={}, isOwnAction={}",
                    event.getEventId(),
                    event.getEntityType(),
                    event.getAction(),
                    event.getTargetUserId(),
                    event.getActorUserId(),
                    event.getIsOwnAction());
        }
    }

    /**
     * Handle successful send
     */
    private void handleSendSuccess(UnifiedActivityEvent event, SendResult<String, Object> result) {
        log.info("Successfully sent unified activity event: eventId={}, topic={}, partition={}, offset={}",
                event.getEventId(),
                result.getRecordMetadata().topic(),
                result.getRecordMetadata().partition(),
                result.getRecordMetadata().offset());
    }

    /**
     * Handle send failure
     */
    private void handleSendFailure(UnifiedActivityEvent event, Throwable ex) {
        log.error("Failed to send unified activity event: eventId={}, error={}",
                event.getEventId(), ex.getMessage(), ex);
    }
}
