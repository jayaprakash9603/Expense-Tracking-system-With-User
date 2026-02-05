
package com.jaya.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.models.AuditEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${audit.kafka.topic:audit-events}")
    private String auditTopic;

    @Value("${budget.expense.kafka.topic:budget-expense-events}")
    private String budgetExpenseTopic;

    @Value("${category.expense.kafka.topic:category-expense-events}")
    private String categoryExpenseTopic;

    @Value("${payment.method.kafka.topic:payment-method-events}")
    private String paymentMethodTopic;

    @Value("${spring.application.name:expense-service}")
    private String serviceName;

    @Value("${spring.profiles.active:dev}")
    private String environment;

    @Value("${app.version:1.0.0}")
    private String serviceVersion;

    public void publishAuditEvent(AuditEvent auditEvent) {
        publishToTopic(auditEvent, auditTopic);
    }

    public void publishAuditEventSync(AuditEvent auditEvent) {
        publishToTopicSync(auditEvent, auditTopic);
    }

    public void publishToBudgetExpenseTopic(AuditEvent auditEvent) {
        publishToTopic(auditEvent, budgetExpenseTopic);
    }

    public void publishToCategoryExpenseTopic(AuditEvent auditEvent) {
        publishToTopic(auditEvent, categoryExpenseTopic);
    }

    public void publishToPaymentMethodTopic(AuditEvent auditEvent) {
        publishToTopic(auditEvent, paymentMethodTopic);
    }

    public void publishToAllTopics(AuditEvent auditEvent) {
        List<String> topics = Arrays.asList(
                auditTopic,
                budgetExpenseTopic,
                categoryExpenseTopic,
                paymentMethodTopic);

        for (String topic : topics) {
            publishToTopic(auditEvent, topic);
        }
    }

    public void publishToMultipleTopics(AuditEvent auditEvent, String... topics) {
        for (String topic : topics) {
            publishToTopic(auditEvent, topic);
        }
    }

    private void publishToTopic(AuditEvent auditEvent, String topic) {
        try {
            enrichAuditEvent(auditEvent);

            String auditEventJson = objectMapper.writeValueAsString(auditEvent);

            CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(topic,
                    auditEvent.getCorrelationId(), auditEventJson);

            future.whenComplete((result, exception) -> {
                if (exception == null) {
                    log.debug("Audit event published successfully: correlationId={}, topic={}, partition={}, offset={}",
                            auditEvent.getCorrelationId(),
                            result.getRecordMetadata().topic(),
                            result.getRecordMetadata().partition(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to publish audit event: correlationId={}, topic={}, error={}",
                            auditEvent.getCorrelationId(), topic, exception.getMessage(), exception);
                }
            });

        } catch (JsonProcessingException e) {
            log.error("Error serializing audit event to JSON: correlationId={}, topic={}",
                    auditEvent.getCorrelationId(), topic, e);
        } catch (Exception e) {
            log.error("Error publishing audit event: correlationId={}, topic={}",
                    auditEvent.getCorrelationId(), topic, e);
        }
    }

    private void publishToTopicSync(AuditEvent auditEvent, String topic) {
        try {
            enrichAuditEvent(auditEvent);

            String auditEventJson = objectMapper.writeValueAsString(auditEvent);

            SendResult<String, String> result = kafkaTemplate.send(topic, auditEvent.getCorrelationId(), auditEventJson)
                    .get();

            log.debug("Audit event published synchronously: correlationId={}, topic={}, partition={}, offset={}",
                    auditEvent.getCorrelationId(),
                    result.getRecordMetadata().topic(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());

        } catch (Exception e) {
            log.error("Error publishing audit event synchronously: correlationId={}, topic={}",
                    auditEvent.getCorrelationId(), topic, e);
            throw new RuntimeException("Failed to publish audit event to topic: " + topic, e);
        }
    }

    private void enrichAuditEvent(AuditEvent auditEvent) {
        if (auditEvent.getTimestamp() == null) {
            auditEvent.setTimestamp(LocalDateTime.now());
        }

        if (auditEvent.getCreatedAt() == null) {
            auditEvent.setCreatedAt(LocalDateTime.now());
        }

        auditEvent.setServiceName(serviceName);
        auditEvent.setEnvironment(environment);
        auditEvent.setServiceVersion(serviceVersion);

        if (auditEvent.getCorrelationId() == null) {
            auditEvent.setCorrelationId(generateCorrelationId());
        }

        if (auditEvent.getStatus() == null) {
            auditEvent.setStatus("SUCCESS");
        }
    }

    private String generateCorrelationId() {
        return serviceName + "-" + System.currentTimeMillis() + "-" +
                Thread.currentThread().getId();
    }

    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}