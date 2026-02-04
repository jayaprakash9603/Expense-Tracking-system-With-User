package com.jaya.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.UnifiedActivityEventDTO;
import com.jaya.models.AuditEvent;
import com.jaya.service.AuditExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Unified Activity Event Consumer for Audit Service
 * 
 * Consumes unified events from the single topic and converts them to AuditEvent
 * for storage and processing.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityEventConsumer {

    private final AuditExpenseService auditService;
    private final ObjectMapper objectMapper;

    /**
     * Consumes unified activity events and converts to audit events
     */
    @KafkaListener(topics = "${kafka.topics.unified-activity-events:unified-activity-events}", groupId = "${audit.kafka.consumer.group-id:audit-service-unified-group}", containerFactory = "auditKafkaListenerContainerFactory")
    public void consumeUnifiedEvent(
            Object payload,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        try {
            UnifiedActivityEventDTO unifiedEvent = convertToDto(payload, UnifiedActivityEventDTO.class);

            if (unifiedEvent == null) {
                log.warn("Failed to parse unified event from topic: {}, offset: {}", topic, offset);
                acknowledgment.acknowledge();
                return;
            }

            // Check if audit is required
            if (!Boolean.TRUE.equals(unifiedEvent.getRequiresAudit())) {
                log.debug("Audit not required for event: {}", unifiedEvent.getEventId());
                acknowledgment.acknowledge();
                return;
            }

            log.info("Received unified activity event from topic: {}, offset: {}, eventId: {}",
                    topic, offset, unifiedEvent.getEventId());

            // Convert to AuditEvent
            AuditEvent auditEvent = convertToAuditEvent(unifiedEvent);

            // Process the audit event
            auditService.processAuditEvent(auditEvent);

            // Acknowledge the message
            acknowledgment.acknowledge();

            log.debug("Successfully processed unified activity event as audit: {}",
                    unifiedEvent.getEventId());

        } catch (Exception e) {
            log.error("Error processing unified activity event from topic: {}, offset: {}",
                    topic, offset, e);
            // Don't acknowledge on error - message will be retried
        }
    }

    /**
     * Batch consumer for unified events (optional - for high throughput)
     */
    @KafkaListener(topics = "${kafka.topics.unified-activity-events:unified-activity-events}", groupId = "${audit.kafka.consumer.batch-group-id:audit-service-unified-batch-group}", containerFactory = "auditBatchKafkaListenerContainerFactory")
    public void consumeUnifiedEventsBatch(
            List<Object> payloads,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            Acknowledgment acknowledgment) {

        if (payloads == null || payloads.isEmpty()) {
            acknowledgment.acknowledge();
            return;
        }

        long startTime = System.currentTimeMillis();
        log.info("📦 Received BATCH of {} unified events for audit - processing...", payloads.size());

        int successCount = 0;
        int skipCount = 0;

        for (Object payload : payloads) {
            try {
                UnifiedActivityEventDTO unifiedEvent = convertToDto(payload, UnifiedActivityEventDTO.class);

                if (unifiedEvent == null) {
                    skipCount++;
                    continue;
                }

                // Check if audit is required
                if (!Boolean.TRUE.equals(unifiedEvent.getRequiresAudit())) {
                    skipCount++;
                    continue;
                }

                // Convert and process
                AuditEvent auditEvent = convertToAuditEvent(unifiedEvent);
                auditService.processAuditEvent(auditEvent);
                successCount++;

            } catch (Exception e) {
                log.error("Error processing unified event in batch: {}", e.getMessage());
            }
        }

        // Acknowledge the batch
        acknowledgment.acknowledge();

        long duration = System.currentTimeMillis() - startTime;
        log.info("✅ Processed {}/{} unified events as audit in {}ms (skipped: {})",
                successCount, payloads.size(), duration, skipCount);
    }

    /**
     * Convert UnifiedActivityEventDTO to AuditEvent
     */
    private AuditEvent convertToAuditEvent(UnifiedActivityEventDTO unifiedEvent) {
        return AuditEvent.builder()
                // User Information
                .userId(unifiedEvent.getActorUserId())
                .username(unifiedEvent.getActorUserName())
                .userRole(unifiedEvent.getActorRole())

                // Entity Information
                .entityId(unifiedEvent.getEntityId() != null ? unifiedEvent.getEntityId().toString() : null)
                .entityType(unifiedEvent.getEntityType())
                .actionType(unifiedEvent.getAction())

                // Audit Details
                .description(unifiedEvent.getDescription())
                .details(buildDetails(unifiedEvent))
                .oldValues(unifiedEvent.getOldValues())
                .newValues(unifiedEvent.getNewValues())

                // Timing
                .timestamp(unifiedEvent.getTimestamp() != null ? unifiedEvent.getTimestamp() : LocalDateTime.now())
                .createdAt(LocalDateTime.now())

                // Request Information
                .ipAddress(unifiedEvent.getIpAddress())
                .userAgent(unifiedEvent.getUserAgent())
                .sessionId(unifiedEvent.getSessionId())
                .correlationId(unifiedEvent.getCorrelationId() != null ? unifiedEvent.getCorrelationId()
                        : unifiedEvent.getEventId())
                .requestId(unifiedEvent.getRequestId())

                // Service Information
                .serviceName(unifiedEvent.getSourceService())
                .serviceVersion(unifiedEvent.getServiceVersion())
                .environment(unifiedEvent.getEnvironment())

                // Status
                .status(unifiedEvent.getStatus())
                .errorMessage(unifiedEvent.getErrorMessage())
                .responseCode(unifiedEvent.getResponseCode())

                // Additional
                .method(unifiedEvent.getHttpMethod())
                .endpoint(unifiedEvent.getEndpoint())
                .executionTimeMs(unifiedEvent.getExecutionTimeMs())
                .source("UNIFIED_EVENT")

                .build();
    }

    /**
     * Build details string from unified event
     */
    private String buildDetails(UnifiedActivityEventDTO event) {
        StringBuilder details = new StringBuilder();
        details.append("Entity: ").append(event.getEntityType());
        details.append(", Action: ").append(event.getAction());

        if (event.getEntityName() != null) {
            details.append(", Name: ").append(event.getEntityName());
        }
        if (event.getAmount() != null) {
            details.append(", Amount: ").append(event.getAmount());
        }
        if (event.getTargetUserId() != null && !event.getTargetUserId().equals(event.getActorUserId())) {
            details.append(", On behalf of user: ").append(event.getTargetUserId());
        }

        return details.toString();
    }

    /**
     * Converts payload to DTO
     */
    private <T> T convertToDto(Object payload, Class<T> dtoClass) {
        try {
            if (payload instanceof Map) {
                return objectMapper.convertValue(payload, dtoClass);
            }
            if (dtoClass.isInstance(payload)) {
                return dtoClass.cast(payload);
            }
            // Try parsing as string
            if (payload instanceof String) {
                return objectMapper.readValue((String) payload, dtoClass);
            }
            throw new IllegalArgumentException("Unsupported payload type: " + payload.getClass().getName());
        } catch (Exception e) {
            log.error("Failed to convert payload to {}: {}", dtoClass.getSimpleName(), e.getMessage());
            return null;
        }
    }
}
