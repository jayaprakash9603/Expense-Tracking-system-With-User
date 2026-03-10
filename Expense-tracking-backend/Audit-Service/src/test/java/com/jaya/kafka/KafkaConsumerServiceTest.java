package com.jaya.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;
import com.jaya.repository.AuditExpenseRepository;
import com.jaya.testutil.AuditTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KafkaConsumerServiceTest {

    @Mock
    private AuditExpenseRepository auditExpenseRepository;

    private KafkaConsumerService kafkaConsumerService;

    @BeforeEach
    void setUp() {
        kafkaConsumerService = new KafkaConsumerService(auditExpenseRepository);
    }

    @Nested
    @DisplayName("consumeAuditEvent")
    class ConsumeAuditEventTests {

        @Test
        @DisplayName("should parse JSON and save audit expense")
        void shouldParseAndSaveAuditExpense() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
            String json = mapper.writeValueAsString(event);

            when(auditExpenseRepository.save(any(AuditExpense.class)))
                    .thenAnswer(invocation -> invocation.getArgument(0));

            kafkaConsumerService.consumeAuditEvent(json);

            ArgumentCaptor<AuditExpense> captor = ArgumentCaptor.forClass(AuditExpense.class);
            verify(auditExpenseRepository).save(captor.capture());

            AuditExpense saved = captor.getValue();
            assertThat(saved.getUserId()).isEqualTo(event.getUserId());
            assertThat(saved.getUsername()).isEqualTo(event.getUsername());
            assertThat(saved.getEntityId()).isEqualTo(event.getEntityId());
            assertThat(saved.getEntityType()).isEqualTo(event.getEntityType());
            assertThat(saved.getActionType()).isEqualTo(event.getActionType());
            assertThat(saved.getDetails()).isEqualTo(event.getDetails());
            assertThat(saved.getIpAddress()).isEqualTo(event.getIpAddress());
        }

        @Test
        @DisplayName("should handle invalid JSON gracefully")
        void shouldHandleInvalidJson() {
            kafkaConsumerService.consumeAuditEvent("not-valid-json");

            verify(auditExpenseRepository, never()).save(any());
        }

        @Test
        @DisplayName("should handle repository save failure gracefully")
        void shouldHandleSaveFailure() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
            String json = mapper.writeValueAsString(event);

            when(auditExpenseRepository.save(any(AuditExpense.class)))
                    .thenThrow(new RuntimeException("DB error"));

            kafkaConsumerService.consumeAuditEvent(json);

            verify(auditExpenseRepository).save(any());
        }

        @Test
        @DisplayName("should handle empty JSON string")
        void shouldHandleEmptyJson() {
            kafkaConsumerService.consumeAuditEvent("");

            verify(auditExpenseRepository, never()).save(any());
        }
    }
}
