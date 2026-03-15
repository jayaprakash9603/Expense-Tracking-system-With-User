package com.jaya.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;
import com.jaya.service.AuditExpenseService;
import com.jaya.testutil.AuditTestDataFactory;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.support.Acknowledgment;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditEventConsumerTest {

    @Mock
    private AuditExpenseService auditService;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private Acknowledgment acknowledgment;

    @InjectMocks
    private AuditEventConsumer auditEventConsumer;

    private AuditEvent testAuditEvent;

    @BeforeEach
    void setUp() {
        testAuditEvent = AuditTestDataFactory.buildAuditEvent();
    }

    @Nested
    @DisplayName("consumeAuditEvent")
    class ConsumeAuditEventTests {

        @Test
        @DisplayName("should process AuditEvent payload directly")
        void shouldProcessAuditEventPayloadDirectly() {
            ConsumerRecord<String, Object> record = new ConsumerRecord<>(
                    "audit-events", 0, 0L, "key", testAuditEvent);

            auditEventConsumer.consumeAuditEvent(record, acknowledgment);

            verify(auditService).processAuditEvent(testAuditEvent);
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should convert Map payload to AuditEvent and process")
        void shouldConvertMapPayload() {
            Map<String, Object> mapPayload = new HashMap<>();
            mapPayload.put("userId", 1);
            mapPayload.put("actionType", "CREATE");

            ConsumerRecord<String, Object> record = new ConsumerRecord<>(
                    "audit-events", 0, 0L, "key", mapPayload);

            when(objectMapper.convertValue(mapPayload, AuditEvent.class)).thenReturn(testAuditEvent);

            auditEventConsumer.consumeAuditEvent(record, acknowledgment);

            verify(objectMapper).convertValue(mapPayload, AuditEvent.class);
            verify(auditService).processAuditEvent(testAuditEvent);
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should parse String payload to AuditEvent and process")
        void shouldParseStringPayload() throws Exception {
            String jsonPayload = "{\"userId\":1,\"actionType\":\"CREATE\"}";
            ConsumerRecord<String, Object> record = new ConsumerRecord<>(
                    "audit-events", 0, 0L, "key", jsonPayload);

            when(objectMapper.readValue(jsonPayload, AuditEvent.class)).thenReturn(testAuditEvent);

            auditEventConsumer.consumeAuditEvent(record, acknowledgment);

            verify(objectMapper).readValue(jsonPayload, AuditEvent.class);
            verify(auditService).processAuditEvent(testAuditEvent);
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should acknowledge and skip unknown payload type")
        void shouldSkipUnknownPayloadType() {
            ConsumerRecord<String, Object> record = new ConsumerRecord<>(
                    "audit-events", 0, 0L, "key", 12345);

            auditEventConsumer.consumeAuditEvent(record, acknowledgment);

            verify(auditService, never()).processAuditEvent(any());
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should acknowledge even when processing throws exception")
        void shouldAcknowledgeOnProcessingFailure() {
            ConsumerRecord<String, Object> record = new ConsumerRecord<>(
                    "audit-events", 0, 0L, "key", testAuditEvent);

            doThrow(new RuntimeException("Processing error")).when(auditService)
                    .processAuditEvent(testAuditEvent);

            auditEventConsumer.consumeAuditEvent(record, acknowledgment);

            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should acknowledge when string parsing fails")
        void shouldAcknowledgeOnParseFailure() throws Exception {
            String invalidJson = "not-valid-json";
            ConsumerRecord<String, Object> record = new ConsumerRecord<>(
                    "audit-events", 0, 0L, "key", invalidJson);

            when(objectMapper.readValue(invalidJson, AuditEvent.class))
                    .thenThrow(new RuntimeException("Parse error"));

            auditEventConsumer.consumeAuditEvent(record, acknowledgment);

            verify(acknowledgment).acknowledge();
        }
    }
}
