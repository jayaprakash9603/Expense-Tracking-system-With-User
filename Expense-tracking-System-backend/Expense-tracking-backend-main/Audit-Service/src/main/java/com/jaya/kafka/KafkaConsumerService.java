package com.jaya.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;
import com.jaya.repository.AuditExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerService.class);
    private final AuditExpenseRepository auditExpenseRepository;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @KafkaListener(topics = "audit-topic", groupId = "audit-group")
    public void consumeAuditEvent(String auditEventJson) {
        try {
            AuditEvent auditEvent = objectMapper.readValue(auditEventJson, AuditEvent.class);

            AuditExpense auditExpense = new AuditExpense();
            auditExpense.setUserId(auditEvent.getUserId());
            auditExpense.setUsername(auditEvent.getUsername());
            auditExpense.setEntityId(auditEvent.getEntityId());
            auditExpense.setEntityType(auditEvent.getEntityType());
            auditExpense.setActionType(auditEvent.getActionType());
            auditExpense.setDetails(auditEvent.getDetails());
            auditExpense.setTimestamp(auditEvent.getTimestamp());
            auditExpense.setIpAddress(auditEvent.getIpAddress());

            auditExpenseRepository.save(auditExpense);

            logger.info("Successfully saved audit event: {}", auditExpense);
        } catch (JsonProcessingException e) {
            logger.error("Error deserializing audit event: {}", e.getMessage());
            logger.error("Raw message: {}", auditEventJson);
        } catch (Exception e) {
            logger.error("Error processing audit event: {}", e.getMessage());
        }
    }
}