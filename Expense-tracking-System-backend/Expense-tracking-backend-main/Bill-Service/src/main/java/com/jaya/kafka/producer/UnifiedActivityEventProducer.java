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

@Slf4j
@Component
@RequiredArgsConstructor
public class UnifiedActivityEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.unified-activity-events:unified-activity-events}")
    private String topicName;

    @Value("${spring.application.name:BILL-SERVICE}")
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

            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topicName, key, event);

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

    public SendResult<String, Object> sendEventSync(UnifiedActivityEvent event) {
        try {
            enrichEvent(event);
            validateEvent(event);
            String key = generatePartitionKey(event);
            logEventDetails(event);

            SendResult<String, Object> result = kafkaTemplate.send(topicName, key, event).get();
            handleSendSuccess(event, result);
            return result;
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
        return event.getTargetUserId().toString();
    }

    private void logEventDetails(UnifiedActivityEvent event) {
        if (log.isDebugEnabled()) {
            try {
                String eventJson = objectMapper.writeValueAsString(event);
                log.debug("Sending unified activity event: {}", eventJson);
            } catch (JsonProcessingException e) {
                log.debug("Sending unified activity event: eventId={}", event.getEventId());
            }
        } else {
            log.info(
                    "Sending unified activity event: eventId={}, entityType={}, action={}, targetUserId={}, isOwnAction={}",
                    event.getEventId(), event.getEntityType(), event.getAction(),
                    event.getTargetUserId(), event.getIsOwnAction());
        }
    }

    private void handleSendSuccess(UnifiedActivityEvent event, SendResult<String, Object> result) {
        log.info("Successfully sent unified activity event: eventId={}, partition={}, offset={}",
                event.getEventId(),
                result.getRecordMetadata().partition(),
                result.getRecordMetadata().offset());
    }

    private void handleSendFailure(UnifiedActivityEvent event, Throwable ex) {
        log.error("Failed to send unified activity event: eventId={}, error={}",
                event.getEventId(), ex.getMessage(), ex);
    }
}
