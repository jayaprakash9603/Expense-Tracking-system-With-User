package com.jaya.common.kafka.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.kafka.events.AuditEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Producer for Audit Events.
 * Sends audit events to the Audit Service for logging and compliance.
 */
@Slf4j
@Component
public class AuditEventProducer extends NotificationEventProducer<AuditEvent> {

    @Value("${kafka.topics.audit-events:audit-events}")
    private String topicName;

    public AuditEventProducer(KafkaTemplate<String, Object> kafkaTemplate, ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Audit";
    }

    @Override
    protected String generatePartitionKey(AuditEvent event) {
        if (event.getUserId() != null) {
            return event.getUserId().toString();
        }
        return super.generatePartitionKey(event);
    }

    @Override
    protected void validateEvent(AuditEvent event) {
        super.validateEvent(event);

        if (event.getAction() == null || event.getAction().isBlank()) {
            throw new IllegalArgumentException("Action is required for audit event");
        }
        if (event.getEntityType() == null || event.getEntityType().isBlank()) {
            throw new IllegalArgumentException("Entity type is required for audit event");
        }
    }
}
