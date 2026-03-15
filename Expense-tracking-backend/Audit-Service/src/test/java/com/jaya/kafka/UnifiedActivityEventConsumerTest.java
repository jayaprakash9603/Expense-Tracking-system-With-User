package com.jaya.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.UnifiedActivityEventDTO;
import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;
import com.jaya.service.AuditExpenseService;
import com.jaya.testutil.AuditTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.support.Acknowledgment;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UnifiedActivityEventConsumerTest {

    @Mock
    private AuditExpenseService auditService;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private Acknowledgment acknowledgment;

    @InjectMocks
    private UnifiedActivityEventConsumer consumer;

    private UnifiedActivityEventDTO testUnifiedEvent;

    @BeforeEach
    void setUp() {
        testUnifiedEvent = AuditTestDataFactory.buildUnifiedActivityEvent();
    }

    // ─── consumeUnifiedEvent (single) ───────────────────────────────

    @Nested
    @DisplayName("consumeUnifiedEvent - single")
    class SingleEventTests {

        @Test
        @DisplayName("should process unified event that requires audit")
        void shouldProcessEventRequiringAudit() {
            when(auditService.processAuditEvent(any(AuditEvent.class)))
                    .thenReturn(AuditTestDataFactory.buildAuditExpense());

            consumer.consumeUnifiedEvent(testUnifiedEvent, "unified-activity-events", 0L, acknowledgment);

            verify(auditService).processAuditEvent(any(AuditEvent.class));
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should skip event when requiresAudit is false")
        void shouldSkipNonAuditEvent() {
            UnifiedActivityEventDTO nonAuditEvent = AuditTestDataFactory.buildNonAuditUnifiedEvent();

            consumer.consumeUnifiedEvent(nonAuditEvent, "unified-activity-events", 0L, acknowledgment);

            verify(auditService, never()).processAuditEvent(any());
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should skip event when requiresAudit is null")
        void shouldSkipEventWithNullRequiresAudit() {
            testUnifiedEvent.setRequiresAudit(null);

            consumer.consumeUnifiedEvent(testUnifiedEvent, "unified-activity-events", 0L, acknowledgment);

            verify(auditService, never()).processAuditEvent(any());
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should acknowledge when conversion returns null")
        void shouldAcknowledgeWhenConversionReturnsNull() throws Exception {
            when(objectMapper.readValue(eq("invalid"), eq(UnifiedActivityEventDTO.class)))
                    .thenThrow(new com.fasterxml.jackson.core.JsonParseException(null, "bad"));

            consumer.consumeUnifiedEvent("invalid", "unified-activity-events", 0L, acknowledgment);

            verify(auditService, never()).processAuditEvent(any());
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should convert unified event to audit event with correct field mapping")
        void shouldMapFieldsCorrectly() {
            when(auditService.processAuditEvent(any(AuditEvent.class)))
                    .thenReturn(AuditTestDataFactory.buildAuditExpense());

            consumer.consumeUnifiedEvent(testUnifiedEvent, "topic", 0L, acknowledgment);

            ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
            verify(auditService).processAuditEvent(captor.capture());

            AuditEvent captured = captor.getValue();
            assertThat(captured.getUserId()).isEqualTo(testUnifiedEvent.getActorUserId());
            assertThat(captured.getUsername()).isEqualTo(testUnifiedEvent.getActorUserName());
            assertThat(captured.getUserRole()).isEqualTo(testUnifiedEvent.getActorRole());
            assertThat(captured.getEntityId()).isEqualTo(testUnifiedEvent.getEntityId().toString());
            assertThat(captured.getEntityType()).isEqualTo(testUnifiedEvent.getEntityType());
            assertThat(captured.getActionType()).isEqualTo(testUnifiedEvent.getAction());
            assertThat(captured.getServiceName()).isEqualTo(testUnifiedEvent.getSourceService());
            assertThat(captured.getIpAddress()).isEqualTo(testUnifiedEvent.getIpAddress());
            assertThat(captured.getStatus()).isEqualTo(testUnifiedEvent.getStatus());
            assertThat(captured.getSource()).isEqualTo("UNIFIED_EVENT");
        }

        @Test
        @DisplayName("should handle null entityId in unified event")
        void shouldHandleNullEntityId() {
            testUnifiedEvent.setEntityId(null);
            when(auditService.processAuditEvent(any(AuditEvent.class)))
                    .thenReturn(AuditTestDataFactory.buildAuditExpense());

            consumer.consumeUnifiedEvent(testUnifiedEvent, "topic", 0L, acknowledgment);

            ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
            verify(auditService).processAuditEvent(captor.capture());
            assertThat(captor.getValue().getEntityId()).isNull();
        }

        @Test
        @DisplayName("should use eventId as correlationId when correlationId is null")
        void shouldUseEventIdAsCorrelationIdWhenNull() {
            testUnifiedEvent.setCorrelationId(null);
            when(auditService.processAuditEvent(any(AuditEvent.class)))
                    .thenReturn(AuditTestDataFactory.buildAuditExpense());

            consumer.consumeUnifiedEvent(testUnifiedEvent, "topic", 0L, acknowledgment);

            ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
            verify(auditService).processAuditEvent(captor.capture());
            assertThat(captor.getValue().getCorrelationId()).isEqualTo(testUnifiedEvent.getEventId());
        }
    }

    // ─── consumeUnifiedEventsBatch ──────────────────────────────────

    @Nested
    @DisplayName("consumeUnifiedEventsBatch")
    class BatchEventTests {

        @Test
        @DisplayName("should process batch of audit-required events")
        void shouldProcessBatch() {
            List<Object> payloads = List.of(testUnifiedEvent, testUnifiedEvent);
            when(auditService.processAuditEvent(any(AuditEvent.class)))
                    .thenReturn(AuditTestDataFactory.buildAuditExpense());

            consumer.consumeUnifiedEventsBatch(payloads, acknowledgment);

            verify(auditService, times(2)).processAuditEvent(any(AuditEvent.class));
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should acknowledge empty batch")
        void shouldAcknowledgeEmptyBatch() {
            consumer.consumeUnifiedEventsBatch(List.of(), acknowledgment);

            verify(auditService, never()).processAuditEvent(any());
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should acknowledge null batch")
        void shouldAcknowledgeNullBatch() {
            consumer.consumeUnifiedEventsBatch(null, acknowledgment);

            verify(auditService, never()).processAuditEvent(any());
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should skip non-audit events in batch")
        void shouldSkipNonAuditEventsInBatch() {
            UnifiedActivityEventDTO nonAuditEvent = AuditTestDataFactory.buildNonAuditUnifiedEvent();
            List<Object> payloads = List.of(testUnifiedEvent, nonAuditEvent);
            when(auditService.processAuditEvent(any(AuditEvent.class)))
                    .thenReturn(AuditTestDataFactory.buildAuditExpense());

            consumer.consumeUnifiedEventsBatch(payloads, acknowledgment);

            verify(auditService, times(1)).processAuditEvent(any(AuditEvent.class));
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should continue processing batch even if one event fails")
        void shouldContinueOnSingleFailure() {
            UnifiedActivityEventDTO event1 = AuditTestDataFactory.buildUnifiedActivityEvent();
            UnifiedActivityEventDTO event2 = AuditTestDataFactory.buildUnifiedActivityEvent();
            List<Object> payloads = List.of(event1, event2);

            when(auditService.processAuditEvent(any(AuditEvent.class)))
                    .thenThrow(new RuntimeException("Error"))
                    .thenReturn(AuditTestDataFactory.buildAuditExpense());

            consumer.consumeUnifiedEventsBatch(payloads, acknowledgment);

            verify(auditService, times(2)).processAuditEvent(any(AuditEvent.class));
            verify(acknowledgment).acknowledge();
        }

        @Test
        @DisplayName("should skip events that fail conversion in batch")
        void shouldSkipFailedConversionsInBatch() {
            Map<String, Object> invalidPayload = Map.of("bad", "data");
            List<Object> payloads = List.of(invalidPayload, testUnifiedEvent);
            when(objectMapper.convertValue(invalidPayload, UnifiedActivityEventDTO.class))
                    .thenThrow(new IllegalArgumentException("Bad conversion"));
            when(auditService.processAuditEvent(any(AuditEvent.class)))
                    .thenReturn(AuditTestDataFactory.buildAuditExpense());

            consumer.consumeUnifiedEventsBatch(payloads, acknowledgment);

            verify(auditService, times(1)).processAuditEvent(any(AuditEvent.class));
            verify(acknowledgment).acknowledge();
        }
    }
}
