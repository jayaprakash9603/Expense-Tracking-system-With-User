package com.jaya.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.UnifiedActivityEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import com.jaya.common.messaging.MessagingPort;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UnifiedActivityEventProducer {

    private final MessagingPort messagingPort;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.unified-activity-events:unified-activity-events}")
    private String topicName;

    @Value("${spring.application.name:FRIENDSHIP-SERVICE}")
    private String serviceName;

    @Value("${app.version:1.0.0}")
    private String serviceVersion;

    @Value("${spring.profiles.active:dev}")
    private String environment;

    public void sendEvent(UnifiedActivityEvent event) {
        try {
            enrichEvent(event);
            validateEvent(event);
            String key = generatePartitionKey(event);
            logEventDetails(event);

            messagingPort.send(topicName, key, event);
            handleSendSuccess(event);
        } catch (Exception e) {
            log.error("Error while preparing unified activity event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send unified activity event", e);
        }
    }

    public void sendEventSync(UnifiedActivityEvent event) {
        try {
            enrichEvent(event);
            validateEvent(event);
            String key = generatePartitionKey(event);
            logEventDetails(event);

            messagingPort.sendAsync(topicName, key, event).get();
            handleSendSuccess(event);
        } catch (Exception e) {
            handleSendFailure(event, e);
            throw new RuntimeException("Failed to send unified activity event synchronously", e);
        }
    }

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
        if (event.getActorUserId() != null && event.getTargetUserId() != null) {
            event.calculateIsOwnAction();
        }
    }

    private void validateEvent(UnifiedActivityEvent event) {
        if (event == null)
            throw new IllegalArgumentException("Event cannot be null");
        if (event.getTargetUserId() == null)
            throw new IllegalArgumentException("Target user ID is required");
        if (event.getEntityType() == null)
            throw new IllegalArgumentException("Entity type is required");
        if (event.getAction() == null)
            throw new IllegalArgumentException("Action is required");
    }

    private String generatePartitionKey(UnifiedActivityEvent event) {
        return event.getTargetUserId() != null ? event.getTargetUserId().toString() : event.getEventId();
    }

    private void logEventDetails(UnifiedActivityEvent event) {
        log.debug(
                "Sending unified activity event: eventId={}, entityType={}, action={}, actor={}, target={}, isOwnAction={}",
                event.getEventId(),
                event.getEntityType(),
                event.getAction(),
                event.getActorUserId(),
                event.getTargetUserId(),
                event.getIsOwnAction());
    }

    private void handleSendSuccess(UnifiedActivityEvent event) {
        log.info("Unified activity event sent successfully: eventId={}, entityType={}, action={}",
                event.getEventId(),
                event.getEntityType(),
                event.getAction());
    }

    private void handleSendFailure(UnifiedActivityEvent event, Throwable ex) {
        log.error("Failed to send unified activity event: eventId={}, entityType={}, action={}, error={}",
                event.getEventId(),
                event.getEntityType(),
                event.getAction(),
                ex.getMessage(),
                ex);
    }
}
