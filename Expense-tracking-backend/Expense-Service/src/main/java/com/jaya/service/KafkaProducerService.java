package com.jaya.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.common.messaging.MessagingPort;
import com.jaya.models.AuditEvent;
import com.jaya.common.dto.UserDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class KafkaProducerService {
    private static final String AUDIT_TOPIC = "audit-events";
    private final MessagingPort messagingPort;
    private final ObjectMapper objectMapper;

    public KafkaProducerService(MessagingPort messagingPort) {
        this.messagingPort = messagingPort;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public void sendMessage(String message) {
        messagingPort.send("test-topic", message);
        log.debug("Produced message: {}", message);
    }

    public void sendAuditEvent(AuditEvent auditEvent) {
        try {
            String auditEventJson = objectMapper.writeValueAsString(auditEvent);
            messagingPort.send(AUDIT_TOPIC, auditEventJson);
            log.debug("Produced audit event: {}", auditEventJson);
        } catch (JsonProcessingException e) {
            log.error("Error serializing audit event: {}", e.getMessage());
            log.error("Fallback audit log: {}", auditEvent);
        }
    }


    public void sendAuditEvent(UserDTO UserDTO,Integer expenseId,String actionType,String message) {
        AuditEvent auditEvent=convertToAuditEvent(UserDTO,expenseId,actionType,message);
        sendAuditEvent(auditEvent);
    }

    private AuditEvent convertToAuditEvent(UserDTO UserDTO, Integer budgetId, String actionType, String details) {
        AuditEvent auditEvent = new AuditEvent();
        auditEvent.setUserId(UserDTO.getId());
        auditEvent.setUsername(UserDTO.getUsername());
        auditEvent.setEntityId(budgetId.toString());
        auditEvent.setActionType(actionType);
        auditEvent.setDetails(details);
        auditEvent.setTimestamp(LocalDateTime.now());
        return auditEvent;
    }
}
