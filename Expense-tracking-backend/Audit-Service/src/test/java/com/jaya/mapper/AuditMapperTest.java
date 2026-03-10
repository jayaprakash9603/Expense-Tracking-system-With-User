package com.jaya.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;
import com.jaya.testutil.AuditTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditMapperTest {

    @Mock
    private ObjectMapper objectMapper;

    private AuditMapper auditMapper;

    @BeforeEach
    void setUp() {
        auditMapper = new AuditMapper(objectMapper);
    }

    // ─── toAuditExpense ─────────────────────────────────────────────

    @Nested
    @DisplayName("toAuditExpense")
    class ToAuditExpenseTests {

        @Test
        @DisplayName("should map all basic fields from AuditEvent to AuditExpense")
        void shouldMapAllBasicFields() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            when(objectMapper.writeValueAsString(any(Map.class))).thenReturn("{}");

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getUserId()).isEqualTo(event.getUserId());
            assertThat(result.getUsername()).isEqualTo(event.getUsername());
            assertThat(result.getUserRole()).isEqualTo(event.getUserRole());
            assertThat(result.getEntityId()).isEqualTo(event.getEntityId());
            assertThat(result.getEntityType()).isEqualTo(event.getEntityType());
            assertThat(result.getActionType()).isEqualTo(event.getActionType());
            assertThat(result.getDetails()).isEqualTo(event.getDetails());
            assertThat(result.getDescription()).isEqualTo(event.getDescription());
            assertThat(result.getTimestamp()).isEqualTo(event.getTimestamp());
            assertThat(result.getCreatedAt()).isEqualTo(event.getCreatedAt());
            assertThat(result.getUpdatedAt()).isEqualTo(event.getUpdatedAt());
            assertThat(result.getCreatedBy()).isEqualTo(event.getCreatedBy());
            assertThat(result.getLastUpdatedBy()).isEqualTo(event.getLastUpdatedBy());
            assertThat(result.getIpAddress()).isEqualTo(event.getIpAddress());
            assertThat(result.getUserAgent()).isEqualTo(event.getUserAgent());
            assertThat(result.getSessionId()).isEqualTo(event.getSessionId());
            assertThat(result.getCorrelationId()).isEqualTo(event.getCorrelationId());
            assertThat(result.getRequestId()).isEqualTo(event.getRequestId());
            assertThat(result.getServiceName()).isEqualTo(event.getServiceName());
            assertThat(result.getServiceVersion()).isEqualTo(event.getServiceVersion());
            assertThat(result.getEnvironment()).isEqualTo(event.getEnvironment());
            assertThat(result.getStatus()).isEqualTo(event.getStatus());
            assertThat(result.getErrorMessage()).isEqualTo(event.getErrorMessage());
            assertThat(result.getResponseCode()).isEqualTo(event.getResponseCode());
            assertThat(result.getSource()).isEqualTo(event.getSource());
            assertThat(result.getMethod()).isEqualTo(event.getMethod());
            assertThat(result.getEndpoint()).isEqualTo(event.getEndpoint());
            assertThat(result.getExecutionTimeMs()).isEqualTo(event.getExecutionTimeMs());
        }

        @Test
        @DisplayName("should serialize oldValues Map to JSON string")
        void shouldSerializeOldValues() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            when(objectMapper.writeValueAsString(event.getOldValues())).thenReturn("{\"amount\":100.0}");
            when(objectMapper.writeValueAsString(event.getNewValues())).thenReturn("{\"amount\":150.0}");

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getOldValues()).isEqualTo("{\"amount\":100.0}");
        }

        @Test
        @DisplayName("should serialize newValues Map to JSON string")
        void shouldSerializeNewValues() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            when(objectMapper.writeValueAsString(event.getOldValues())).thenReturn("{\"amount\":100.0}");
            when(objectMapper.writeValueAsString(event.getNewValues())).thenReturn("{\"amount\":150.0}");

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getNewValues()).isEqualTo("{\"amount\":150.0}");
        }

        @Test
        @DisplayName("should handle null oldValues gracefully")
        void shouldHandleNullOldValues() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            event.setOldValues(null);
            when(objectMapper.writeValueAsString(event.getNewValues())).thenReturn("{}");

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getOldValues()).isNull();
        }

        @Test
        @DisplayName("should handle null newValues gracefully")
        void shouldHandleNullNewValues() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            event.setNewValues(null);
            when(objectMapper.writeValueAsString(event.getOldValues())).thenReturn("{}");

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getNewValues()).isNull();
        }

        @Test
        @DisplayName("should handle serialization failure for oldValues")
        void shouldHandleOldValuesSerializationFailure() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            event.setNewValues(null);
            when(objectMapper.writeValueAsString(event.getOldValues()))
                    .thenThrow(new JsonProcessingException("Serialization error") {});

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getOldValues()).isNull();
        }

        @Test
        @DisplayName("should handle serialization failure for newValues")
        void shouldHandleNewValuesSerializationFailure() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            event.setOldValues(null);
            when(objectMapper.writeValueAsString(event.getNewValues()))
                    .thenThrow(new JsonProcessingException("Serialization error") {});

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getNewValues()).isNull();
        }

        @Test
        @DisplayName("should set expenseId when entityType is EXPENSE")
        void shouldSetExpenseIdForExpenseEntity() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            event.setEntityType("EXPENSE");
            event.setEntityId("100");
            when(objectMapper.writeValueAsString(any(Map.class))).thenReturn("{}");

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getExpenseId()).isEqualTo(100);
        }

        @Test
        @DisplayName("should set expenseId when entityType is lowercase expense")
        void shouldSetExpenseIdCaseInsensitive() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            event.setEntityType("expense");
            event.setEntityId("200");
            when(objectMapper.writeValueAsString(any(Map.class))).thenReturn("{}");

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getExpenseId()).isEqualTo(200);
        }

        @Test
        @DisplayName("should not set expenseId for non-EXPENSE entityType")
        void shouldNotSetExpenseIdForNonExpense() {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            event.setEntityType("USER");
            event.setEntityId("100");
            event.setOldValues(null);
            event.setNewValues(null);

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getExpenseId()).isNull();
        }

        @Test
        @DisplayName("should handle non-numeric entityId for EXPENSE gracefully")
        void shouldHandleNonNumericEntityId() throws JsonProcessingException {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            event.setEntityType("EXPENSE");
            event.setEntityId("not-a-number");
            when(objectMapper.writeValueAsString(any(Map.class))).thenReturn("{}");

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getExpenseId()).isNull();
        }

        @Test
        @DisplayName("should not set expenseId when entityId is null for EXPENSE")
        void shouldNotSetExpenseIdWhenEntityIdNull() {
            AuditEvent event = AuditTestDataFactory.buildAuditEvent();
            event.setEntityType("EXPENSE");
            event.setEntityId(null);
            event.setOldValues(null);
            event.setNewValues(null);

            AuditExpense result = auditMapper.toAuditExpense(event);

            assertThat(result.getExpenseId()).isNull();
        }
    }

    // ─── toAuditEvent ───────────────────────────────────────────────

    @Nested
    @DisplayName("toAuditEvent")
    class ToAuditEventTests {

        @Test
        @DisplayName("should map all basic fields from AuditExpense to AuditEvent")
        void shouldMapAllBasicFields() {
            AuditExpense expense = AuditTestDataFactory.buildAuditExpense();
            expense.setOldValues(null);
            expense.setNewValues(null);

            AuditEvent result = auditMapper.toAuditEvent(expense);

            assertThat(result.getUserId()).isEqualTo(expense.getUserId());
            assertThat(result.getUsername()).isEqualTo(expense.getUsername());
            assertThat(result.getUserRole()).isEqualTo(expense.getUserRole());
            assertThat(result.getEntityId()).isEqualTo(expense.getEntityId());
            assertThat(result.getEntityType()).isEqualTo(expense.getEntityType());
            assertThat(result.getActionType()).isEqualTo(expense.getActionType());
            assertThat(result.getDetails()).isEqualTo(expense.getDetails());
            assertThat(result.getDescription()).isEqualTo(expense.getDescription());
            assertThat(result.getTimestamp()).isEqualTo(expense.getTimestamp());
            assertThat(result.getIpAddress()).isEqualTo(expense.getIpAddress());
            assertThat(result.getCorrelationId()).isEqualTo(expense.getCorrelationId());
            assertThat(result.getServiceName()).isEqualTo(expense.getServiceName());
            assertThat(result.getStatus()).isEqualTo(expense.getStatus());
            assertThat(result.getMethod()).isEqualTo(expense.getMethod());
            assertThat(result.getEndpoint()).isEqualTo(expense.getEndpoint());
        }

        @Test
        @DisplayName("should deserialize oldValues JSON string to Map")
        void shouldDeserializeOldValues() throws JsonProcessingException {
            AuditExpense expense = AuditTestDataFactory.buildAuditExpense();
            expense.setOldValues("{\"amount\":100.0}");
            expense.setNewValues(null);

            Map<String, Object> expectedMap = new HashMap<>();
            expectedMap.put("amount", 100.0);

            when(objectMapper.getTypeFactory()).thenReturn(new ObjectMapper().getTypeFactory());
            when(objectMapper.readValue(any(String.class), any(com.fasterxml.jackson.databind.JavaType.class)))
                    .thenReturn(expectedMap);

            AuditEvent result = auditMapper.toAuditEvent(expense);

            assertThat(result.getOldValues()).isEqualTo(expectedMap);
        }

        @Test
        @DisplayName("should deserialize newValues JSON string to Map")
        void shouldDeserializeNewValues() throws JsonProcessingException {
            AuditExpense expense = AuditTestDataFactory.buildAuditExpense();
            expense.setOldValues(null);
            expense.setNewValues("{\"amount\":150.0}");

            Map<String, Object> expectedMap = new HashMap<>();
            expectedMap.put("amount", 150.0);

            when(objectMapper.getTypeFactory()).thenReturn(new ObjectMapper().getTypeFactory());
            when(objectMapper.readValue(any(String.class), any(com.fasterxml.jackson.databind.JavaType.class)))
                    .thenReturn(expectedMap);

            AuditEvent result = auditMapper.toAuditEvent(expense);

            assertThat(result.getNewValues()).isEqualTo(expectedMap);
        }

        @Test
        @DisplayName("should handle null oldValues in expense")
        void shouldHandleNullOldValuesInExpense() {
            AuditExpense expense = AuditTestDataFactory.buildAuditExpense();
            expense.setOldValues(null);
            expense.setNewValues(null);

            AuditEvent result = auditMapper.toAuditEvent(expense);

            assertThat(result.getOldValues()).isNull();
        }

        @Test
        @DisplayName("should handle null newValues in expense")
        void shouldHandleNullNewValuesInExpense() {
            AuditExpense expense = AuditTestDataFactory.buildAuditExpense();
            expense.setOldValues(null);
            expense.setNewValues(null);

            AuditEvent result = auditMapper.toAuditEvent(expense);

            assertThat(result.getNewValues()).isNull();
        }

        @Test
        @DisplayName("should handle deserialization failure for oldValues")
        void shouldHandleOldValuesDeserializationFailure() throws JsonProcessingException {
            AuditExpense expense = AuditTestDataFactory.buildAuditExpense();
            expense.setOldValues("{invalid-json}");
            expense.setNewValues(null);

            when(objectMapper.getTypeFactory()).thenReturn(new ObjectMapper().getTypeFactory());
            when(objectMapper.readValue(any(String.class), any(com.fasterxml.jackson.databind.JavaType.class)))
                    .thenThrow(new JsonProcessingException("Parse error") {});

            AuditEvent result = auditMapper.toAuditEvent(expense);

            assertThat(result.getOldValues()).isNull();
        }

        @Test
        @DisplayName("should handle deserialization failure for newValues")
        void shouldHandleNewValuesDeserializationFailure() throws JsonProcessingException {
            AuditExpense expense = AuditTestDataFactory.buildAuditExpense();
            expense.setOldValues(null);
            expense.setNewValues("{invalid-json}");

            when(objectMapper.getTypeFactory()).thenReturn(new ObjectMapper().getTypeFactory());
            when(objectMapper.readValue(any(String.class), any(com.fasterxml.jackson.databind.JavaType.class)))
                    .thenThrow(new JsonProcessingException("Parse error") {});

            AuditEvent result = auditMapper.toAuditEvent(expense);

            assertThat(result.getNewValues()).isNull();
        }
    }
}
