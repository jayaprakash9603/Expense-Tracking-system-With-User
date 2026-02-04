package com.jaya.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.models.AuditEvent;
import com.jaya.service.AuditExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditEventConsumer {

    private final AuditExpenseService auditService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${audit.kafka.topic:audit-events}", groupId = "${audit.kafka.consumer.group-id:audit-service-group}", containerFactory = "auditKafkaListenerContainerFactory")
    public void consumeAuditEvent(ConsumerRecord<String, Object> record, Acknowledgment acknowledgment) {
        String topic = record.topic();
        long offset = record.offset();
        Object payload = record.value();

        try {
            // Convert payload to AuditEvent - handles AuditEvent, LinkedHashMap, and other
            // types
            AuditEvent auditEvent;
            if (payload instanceof AuditEvent) {
                auditEvent = (AuditEvent) payload;
            } else if (payload instanceof Map) {
                auditEvent = objectMapper.convertValue(payload, AuditEvent.class);
            } else if (payload instanceof String) {
                // If payload is a JSON string, parse it
                auditEvent = objectMapper.readValue((String) payload, AuditEvent.class);
            } else {
                log.error("Unknown payload type: {} - value: {}", payload.getClass().getName(), payload);
                acknowledgment.acknowledge();
                return;
            }

            log.info("Received audit event from topic: {}, offset: {}, correlationId: {}",
                    topic, offset, auditEvent.getCorrelationId());

            // Process the audit event
            auditService.processAuditEvent(auditEvent);

            // Acknowledge the message
            acknowledgment.acknowledge();

            log.debug("Successfully processed audit event: {}", auditEvent.getCorrelationId());

        } catch (Exception e) {
            log.error("Error processing audit event at offset {}: {}", offset, e.getMessage(), e);
            // Acknowledge to avoid infinite retry loop - log for manual investigation
            acknowledgment.acknowledge();
        }
    }
}