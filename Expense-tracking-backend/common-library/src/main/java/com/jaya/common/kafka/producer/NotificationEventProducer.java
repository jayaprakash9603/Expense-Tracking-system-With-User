package com.jaya.common.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.messaging.MessagingPort;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class NotificationEventProducer<T> {

    protected final MessagingPort messagingPort;
    protected final ObjectMapper objectMapper;

    protected NotificationEventProducer(MessagingPort messagingPort,
            ObjectMapper objectMapper) {
        this.messagingPort = messagingPort;
        this.objectMapper = objectMapper;
    }

    public void sendEvent(T event) {
        try {
            validateEvent(event);
            String topic = getTopicName();
            String key = generatePartitionKey(event);
            beforeSend(event);
            logEventDetails(event);

            messagingPort.send(topic, key, event);
            afterSendSuccess(event);
            log.debug("Successfully sent {} event to topic {}", getEventTypeName(), topic);

        } catch (Exception e) {
            afterSendFailure(event, e);
            log.error("Error preparing {} event: {}", getEventTypeName(), e.getMessage(), e);
            throw new RuntimeException("Failed to send notification event", e);
        }
    }

    public void sendEventSync(T event) {
        try {
            validateEvent(event);
            String topic = getTopicName();
            String key = generatePartitionKey(event);
            beforeSend(event);

            messagingPort.sendAsync(topic, key, event).get();
            afterSendSuccess(event);
            log.info("Synchronously sent {} event to topic {}", getEventTypeName(), topic);
        } catch (Exception e) {
            log.error("Failed to send {} event to topic synchronously: {}",
                    getEventTypeName(), e.getMessage(), e);
            throw new RuntimeException("Failed to send notification event", e);
        }
    }

    protected abstract String getTopicName();

    protected String getEventTypeName() {
        return this.getClass().getSimpleName();
    }

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

    protected void afterSendSuccess(T event) {
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
