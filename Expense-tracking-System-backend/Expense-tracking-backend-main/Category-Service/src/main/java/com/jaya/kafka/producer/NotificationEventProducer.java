package com.jaya.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;

import java.util.concurrent.CompletableFuture;

@Slf4j
public abstract class NotificationEventProducer<T> {

    protected final KafkaTemplate<String, Object> kafkaTemplate;
    protected final ObjectMapper objectMapper;

    protected NotificationEventProducer(KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    
    public void sendEvent(T event) {
        try {
            validateEvent(event);
            String topic = getTopicName();
            String key = generatePartitionKey(event);
            beforeSend(event);
            logEventDetails(event);

            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, event);

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
    protected abstract String getTopicName();

    protected abstract String getEventTypeName();
    protected void validateEvent(T event) {
        if (event == null) {
            throw new IllegalArgumentException("Event cannot be null");
        }
    }

    protected String generatePartitionKey(T event) {
        return null;
    }

    protected void beforeSend(T event) {
    }

    protected void afterSendSuccess(T event, SendResult<String, Object> result) {
    }

    protected void afterSendFailure(T event, Throwable exception) {
    }

    private void logEventDetails(T event) {
        try {
            String json = objectMapper.writeValueAsString(event);
            log.debug("{} event payload: {}", getEventTypeName(), json);
        } catch (JsonProcessingException e) {
            log.warn("Could not serialize {} event for logging", getEventTypeName());
        }
    }
}
