package com.jaya.mapper;

import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditMapper {

    private final ObjectMapper objectMapper;

    public AuditExpense toAuditExpense(AuditEvent auditEvent) {
        AuditExpense auditExpense = AuditExpense.builder()
                .userId(auditEvent.getUserId())
                .username(auditEvent.getUsername())
                .userRole(auditEvent.getUserRole())
                .entityId(auditEvent.getEntityId())
                .entityType(auditEvent.getEntityType())
                .actionType(auditEvent.getActionType())
                .details(auditEvent.getDetails())
                .description(auditEvent.getDescription())
                .timestamp(auditEvent.getTimestamp())
                .createdAt(auditEvent.getCreatedAt())
                .updatedAt(auditEvent.getUpdatedAt())
                .createdBy(auditEvent.getCreatedBy())
                .lastUpdatedBy(auditEvent.getLastUpdatedBy())
                .ipAddress(auditEvent.getIpAddress())
                .userAgent(auditEvent.getUserAgent())
                .sessionId(auditEvent.getSessionId())
                .correlationId(auditEvent.getCorrelationId())
                .requestId(auditEvent.getRequestId())
                .serviceName(auditEvent.getServiceName())
                .serviceVersion(auditEvent.getServiceVersion())
                .environment(auditEvent.getEnvironment())
                .status(auditEvent.getStatus())
                .errorMessage(auditEvent.getErrorMessage())
                .responseCode(auditEvent.getResponseCode())
                .source(auditEvent.getSource())
                .method(auditEvent.getMethod())
                .endpoint(auditEvent.getEndpoint())
                .executionTimeMs(auditEvent.getExecutionTimeMs())
                .build();

        // Convert maps to JSON strings
        if (auditEvent.getOldValues() != null) {
            try {
                auditExpense.setOldValues(objectMapper.writeValueAsString(auditEvent.getOldValues()));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize old values for audit event: {}", auditEvent.getCorrelationId(), e);
            }
        }

        if (auditEvent.getNewValues() != null) {
            try {
                auditExpense.setNewValues(objectMapper.writeValueAsString(auditEvent.getNewValues()));
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize new values for audit event: {}", auditEvent.getCorrelationId(), e);
            }
        }

        // Handle legacy expense ID for backward compatibility
        if ("EXPENSE".equalsIgnoreCase(auditEvent.getEntityType()) && auditEvent.getEntityId() != null) {
            try {
                auditExpense.setExpenseId(Integer.valueOf(auditEvent.getEntityId()));
            } catch (NumberFormatException e) {
                log.debug("Entity ID is not a valid integer for expense audit: {}", auditEvent.getEntityId());
            }
        }

        return auditExpense;
    }

    public AuditEvent toAuditEvent(AuditExpense auditExpense) {
        AuditEvent.AuditEventBuilder builder = AuditEvent.builder()
                .userId(auditExpense.getUserId())
                .username(auditExpense.getUsername())
                .userRole(auditExpense.getUserRole())
                .entityId(auditExpense.getEntityId())
                .entityType(auditExpense.getEntityType())
                .actionType(auditExpense.getActionType())
                .details(auditExpense.getDetails())
                .description(auditExpense.getDescription())
                .timestamp(auditExpense.getTimestamp())
                .createdAt(auditExpense.getCreatedAt())
                .updatedAt(auditExpense.getUpdatedAt())
                .createdBy(auditExpense.getCreatedBy())
                .lastUpdatedBy(auditExpense.getLastUpdatedBy())
                .ipAddress(auditExpense.getIpAddress())
                .userAgent(auditExpense.getUserAgent())
                .sessionId(auditExpense.getSessionId())
                .correlationId(auditExpense.getCorrelationId())
                .requestId(auditExpense.getRequestId())
                .serviceName(auditExpense.getServiceName())
                .serviceVersion(auditExpense.getServiceVersion())
                .environment(auditExpense.getEnvironment())
                .status(auditExpense.getStatus())
                .errorMessage(auditExpense.getErrorMessage())
                .responseCode(auditExpense.getResponseCode())
                .source(auditExpense.getSource())
                .method(auditExpense.getMethod())
                .endpoint(auditExpense.getEndpoint())
                .executionTimeMs(auditExpense.getExecutionTimeMs());

        // Convert JSON strings back to maps
        if (auditExpense.getOldValues() != null) {
            try {
                builder.oldValues(objectMapper.readValue(auditExpense.getOldValues(),
                        objectMapper.getTypeFactory().constructMapType(java.util.Map.class, String.class, Object.class)));
            } catch (JsonProcessingException e) {
                log.warn("Failed to deserialize old values for audit expense: {}", auditExpense.getId(), e);
            }
        }

        if (auditExpense.getNewValues() != null) {
            try {
                builder.newValues(objectMapper.readValue(auditExpense.getNewValues(),
                        objectMapper.getTypeFactory().constructMapType(java.util.Map.class, String.class, Object.class)));
            } catch (JsonProcessingException e) {
                log.warn("Failed to deserialize new values for audit expense: {}", auditExpense.getId(), e);
            }
        }

        return builder.build();
    }
}