package com.jaya.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.models.AuditEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {
    private static final String AUDIT_TOPIC = "audit-events";
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public void sendMessage(String message) {
        kafkaTemplate.send("test-topic", message);
        System.out.println("Produced message: " + message);
    }

    public void sendAuditEvent(AuditEvent auditEvent) {
        try {
            String auditEventJson = objectMapper.writeValueAsString(auditEvent);
            kafkaTemplate.send(AUDIT_TOPIC, auditEventJson);
            System.out.println("Produced audit event: " + auditEventJson);
        } catch (JsonProcessingException e) {
            System.err.println("Error serializing audit event: " + e.getMessage());
            // Fallback to synchronous logging if Kafka fails
            System.err.println("Fallback audit log: " + auditEvent.toString());
        }
    }
}