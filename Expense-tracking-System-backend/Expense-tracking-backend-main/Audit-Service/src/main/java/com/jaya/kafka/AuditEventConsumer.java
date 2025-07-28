package com.jaya.kafka;

import com.jaya.models.AuditEvent;
import com.jaya.service.AuditExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditEventConsumer {

    private final AuditExpenseService auditService;

    @KafkaListener(
            topics = "${audit.kafka.topic:audit-events}",
            groupId = "${audit.kafka.consumer.group-id:audit-service-group}",
            containerFactory = "auditKafkaListenerContainerFactory"
    )
    public void consumeAuditEvent(
            @Payload AuditEvent auditEvent,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        try {
            log.info("Received audit event from topic: {}, offset: {}, correlationId: {}",
                    topic, offset, auditEvent.getCorrelationId());

            // Process the audit event
            auditService.processAuditEvent(auditEvent);

            // Acknowledge the message
            acknowledgment.acknowledge();

            log.debug("Successfully processed audit event: {}", auditEvent.getCorrelationId());

        } catch (Exception e) {
            log.error("Error processing audit event: {}", auditEvent.getCorrelationId(), e);
            // Don't acknowledge on error - message will be retried
        }
    }
}