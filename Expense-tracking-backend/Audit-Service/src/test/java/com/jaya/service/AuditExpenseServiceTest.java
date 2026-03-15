package com.jaya.service;

import com.jaya.mapper.AuditMapper;
import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;
import com.jaya.repository.AuditExpenseRepository;
import com.jaya.testutil.AuditTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditExpenseServiceTest {

    @Mock
    private AuditExpenseRepository auditExpenseRepository;

    @Mock
    private AuditMapper auditMapper;

    @InjectMocks
    private AuditExpenseService auditExpenseService;

    private AuditEvent testAuditEvent;
    private AuditExpense testAuditExpense;
    private Pageable defaultPageable;

    @BeforeEach
    void setUp() {
        testAuditEvent = AuditTestDataFactory.buildAuditEvent();
        testAuditExpense = AuditTestDataFactory.buildAuditExpense();
        defaultPageable = PageRequest.of(0, 20);
    }

    // ─── processAuditEvent ──────────────────────────────────────────

    @Nested
    @DisplayName("processAuditEvent")
    class ProcessAuditEventTests {

        @Test
        @DisplayName("should map, save and return audit expense")
        void shouldProcessAuditEventSuccessfully() {
            when(auditMapper.toAuditExpense(testAuditEvent)).thenReturn(testAuditExpense);
            when(auditExpenseRepository.save(testAuditExpense)).thenReturn(testAuditExpense);

            AuditExpense result = auditExpenseService.processAuditEvent(testAuditEvent);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            verify(auditMapper).toAuditExpense(testAuditEvent);
            verify(auditExpenseRepository).save(testAuditExpense);
        }

        @Test
        @DisplayName("should set updatedAt when null")
        void shouldSetUpdatedAtWhenNull() {
            testAuditExpense.setUpdatedAt(null);
            when(auditMapper.toAuditExpense(testAuditEvent)).thenReturn(testAuditExpense);
            when(auditExpenseRepository.save(testAuditExpense)).thenReturn(testAuditExpense);

            auditExpenseService.processAuditEvent(testAuditEvent);

            assertThat(testAuditExpense.getUpdatedAt()).isNotNull();
            verify(auditExpenseRepository).save(testAuditExpense);
        }

        @Test
        @DisplayName("should not override updatedAt when already set")
        void shouldNotOverrideUpdatedAtWhenSet() {
            LocalDateTime existingTime = LocalDateTime.of(2024, 1, 1, 12, 0);
            testAuditExpense.setUpdatedAt(existingTime);
            when(auditMapper.toAuditExpense(testAuditEvent)).thenReturn(testAuditExpense);
            when(auditExpenseRepository.save(testAuditExpense)).thenReturn(testAuditExpense);

            auditExpenseService.processAuditEvent(testAuditEvent);

            assertThat(testAuditExpense.getUpdatedAt()).isEqualTo(existingTime);
        }

        @Test
        @DisplayName("should trigger handleFailedLogin for FAILURE + LOGIN")
        void shouldHandleFailedLoginEvent() {
            AuditEvent failedLogin = AuditTestDataFactory.buildFailedLoginEvent();
            AuditExpense failedAudit = AuditExpense.builder()
                    .id(2L)
                    .userId(1)
                    .username("testuser")
                    .entityType("USER")
                    .actionType("LOGIN")
                    .status("FAILURE")
                    .ipAddress("192.168.1.100")
                    .timestamp(LocalDateTime.now())
                    .build();

            when(auditMapper.toAuditExpense(failedLogin)).thenReturn(failedAudit);
            when(auditExpenseRepository.save(failedAudit)).thenReturn(failedAudit);

            AuditExpense result = auditExpenseService.processAuditEvent(failedLogin);

            assertThat(result).isNotNull();
            assertThat(result.getStatus()).isEqualTo("FAILURE");
            assertThat(result.getActionType()).isEqualTo("LOGIN");
        }

        @Test
        @DisplayName("should trigger validateExpenseCreation for EXPENSE + CREATE")
        void shouldValidateExpenseCreation() {
            AuditEvent expenseCreate = AuditTestDataFactory.buildExpenseCreateEvent();
            AuditExpense createdAudit = AuditExpense.builder()
                    .id(3L)
                    .userId(1)
                    .username("testuser")
                    .entityType("EXPENSE")
                    .actionType("CREATE")
                    .entityId("200")
                    .status("SUCCESS")
                    .timestamp(LocalDateTime.now())
                    .build();

            when(auditMapper.toAuditExpense(expenseCreate)).thenReturn(createdAudit);
            when(auditExpenseRepository.save(createdAudit)).thenReturn(createdAudit);

            AuditExpense result = auditExpenseService.processAuditEvent(expenseCreate);

            assertThat(result).isNotNull();
            assertThat(result.getEntityType()).isEqualTo("EXPENSE");
            assertThat(result.getActionType()).isEqualTo("CREATE");
        }

        @Test
        @DisplayName("should throw exception when repository save fails")
        void shouldThrowExceptionWhenSaveFails() {
            when(auditMapper.toAuditExpense(testAuditEvent)).thenReturn(testAuditExpense);
            when(auditExpenseRepository.save(testAuditExpense))
                    .thenThrow(new RuntimeException("Database error"));

            assertThatThrownBy(() -> auditExpenseService.processAuditEvent(testAuditEvent))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Database error");
        }

        @Test
        @DisplayName("should throw exception when mapper fails")
        void shouldThrowExceptionWhenMapperFails() {
            when(auditMapper.toAuditExpense(testAuditEvent))
                    .thenThrow(new RuntimeException("Mapping error"));

            assertThatThrownBy(() -> auditExpenseService.processAuditEvent(testAuditEvent))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Mapping error");
        }
    }

    // ─── getAllAuditLogs ────────────────────────────────────────────

    @Nested
    @DisplayName("getAllAuditLogs")
    class GetAllAuditLogsTests {

        @Test
        @DisplayName("should return audit logs for user")
        void shouldReturnAuditLogsForUser() {
            List<AuditExpense> logs = Arrays.asList(testAuditExpense, testAuditExpense);
            when(auditExpenseRepository.findByUserId(1)).thenReturn(logs);

            List<AuditExpense> result = auditExpenseService.getAllAuditLogs(1);

            assertThat(result).hasSize(2);
            verify(auditExpenseRepository).findByUserId(1);
        }

        @Test
        @DisplayName("should return empty list when no logs found")
        void shouldReturnEmptyListWhenNoLogs() {
            when(auditExpenseRepository.findByUserId(999)).thenReturn(Collections.emptyList());

            List<AuditExpense> result = auditExpenseService.getAllAuditLogs(999);

            assertThat(result).isEmpty();
        }
    }

    // ─── getAuditTrailForEntity ─────────────────────────────────────

    @Nested
    @DisplayName("getAuditTrailForEntity")
    class GetAuditTrailForEntityTests {

        @Test
        @DisplayName("should return audit trail for entity")
        void shouldReturnAuditTrailForEntity() {
            List<AuditExpense> logs = List.of(testAuditExpense);
            when(auditExpenseRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc("EXPENSE", "100"))
                    .thenReturn(logs);

            List<AuditExpense> result = auditExpenseService.getAuditTrailForEntity("EXPENSE", "100");

            assertThat(result).hasSize(1);
            verify(auditExpenseRepository)
                    .findByEntityTypeAndEntityIdOrderByTimestampDesc("EXPENSE", "100");
        }
    }

    // ─── getAuditTrailForUser ───────────────────────────────────────

    @Nested
    @DisplayName("getAuditTrailForUser")
    class GetAuditTrailForUserTests {

        @Test
        @DisplayName("should return list of audit logs for user")
        void shouldReturnListForUser() {
            List<AuditExpense> logs = List.of(testAuditExpense);
            when(auditExpenseRepository.findByUserIdOrderByTimestampDesc(1)).thenReturn(logs);

            List<AuditExpense> result = auditExpenseService.getAuditTrailForUser(1);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("should return paginated audit logs for user")
        void shouldReturnPaginatedLogsForUser() {
            Page<AuditExpense> page = new PageImpl<>(List.of(testAuditExpense), defaultPageable, 1);
            when(auditExpenseRepository.findByUserIdOrderByTimestampDesc(1, defaultPageable))
                    .thenReturn(page);

            Page<AuditExpense> result = auditExpenseService.getAuditTrailForUser(1, defaultPageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
        }
    }

    // ─── findByCorrelationId ────────────────────────────────────────

    @Nested
    @DisplayName("findByCorrelationId")
    class FindByCorrelationIdTests {

        @Test
        @DisplayName("should find audit by correlation ID")
        void shouldFindByCorrelationId() {
            when(auditExpenseRepository.findByCorrelationId("corr-12345"))
                    .thenReturn(Optional.of(testAuditExpense));

            Optional<AuditExpense> result = auditExpenseService.findByCorrelationId("corr-12345");

            assertThat(result).isPresent();
            assertThat(result.get().getCorrelationId()).isEqualTo("corr-12345");
        }

        @Test
        @DisplayName("should return empty when correlation ID not found")
        void shouldReturnEmptyWhenNotFound() {
            when(auditExpenseRepository.findByCorrelationId("nonexistent"))
                    .thenReturn(Optional.empty());

            Optional<AuditExpense> result = auditExpenseService.findByCorrelationId("nonexistent");

            assertThat(result).isEmpty();
        }
    }

    // ─── getAuditsByDateRange ───────────────────────────────────────

    @Nested
    @DisplayName("getAuditsByDateRange")
    class GetAuditsByDateRangeTests {

        @Test
        @DisplayName("should return audits within date range")
        void shouldReturnAuditsInDateRange() {
            LocalDateTime start = LocalDateTime.now().minusDays(7);
            LocalDateTime end = LocalDateTime.now();
            List<AuditExpense> logs = List.of(testAuditExpense);
            when(auditExpenseRepository.findByTimestampBetweenOrderByTimestampDesc(start, end))
                    .thenReturn(logs);

            List<AuditExpense> result = auditExpenseService.getAuditsByDateRange(start, end);

            assertThat(result).hasSize(1);
        }
    }

    // ─── getFailedOperations ────────────────────────────────────────

    @Nested
    @DisplayName("getFailedOperations")
    class GetFailedOperationsTests {

        @Test
        @DisplayName("should return failed operations since given time")
        void shouldReturnFailedOperations() {
            LocalDateTime since = LocalDateTime.now().minusHours(1);
            AuditExpense failedAudit = AuditTestDataFactory.buildAuditExpense();
            failedAudit.setStatus("FAILURE");
            when(auditExpenseRepository.findByStatusAndTimestampAfterOrderByTimestampDesc("FAILURE", since))
                    .thenReturn(List.of(failedAudit));

            List<AuditExpense> result = auditExpenseService.getFailedOperations(since);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getStatus()).isEqualTo("FAILURE");
        }
    }

    // ─── Paginated query methods ────────────────────────────────────

    @Nested
    @DisplayName("Paginated query methods")
    class PaginatedQueryTests {

        @Test
        @DisplayName("should return all audit logs paginated")
        void shouldReturnAllPaginated() {
            Page<AuditExpense> page = new PageImpl<>(List.of(testAuditExpense), defaultPageable, 1);
            when(auditExpenseRepository.findAllOrderByTimestampDesc(defaultPageable)).thenReturn(page);

            Page<AuditExpense> result = auditExpenseService.getAllAuditLogsPaginated(defaultPageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("should return audit logs by type paginated")
        void shouldReturnByTypePaginated() {
            Page<AuditExpense> page = new PageImpl<>(List.of(testAuditExpense), defaultPageable, 1);
            when(auditExpenseRepository.findByActionTypeOrderByTimestampDesc("CREATE", defaultPageable))
                    .thenReturn(page);

            Page<AuditExpense> result = auditExpenseService.getAuditLogsByType("CREATE", defaultPageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("should return audit logs since timestamp")
        void shouldReturnLogsSince() {
            LocalDateTime since = LocalDateTime.now().minusDays(7);
            Page<AuditExpense> page = new PageImpl<>(List.of(testAuditExpense), defaultPageable, 1);
            when(auditExpenseRepository.findByTimestampAfterOrderByTimestampDesc(since, defaultPageable))
                    .thenReturn(page);

            Page<AuditExpense> result = auditExpenseService.getAuditLogsSince(since, defaultPageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("should return audit logs by type and time")
        void shouldReturnByTypeAndTime() {
            LocalDateTime since = LocalDateTime.now().minusDays(7);
            Page<AuditExpense> page = new PageImpl<>(List.of(testAuditExpense), defaultPageable, 1);
            when(auditExpenseRepository.findByActionTypeAndTimestampAfterOrderByTimestampDesc(
                    "CREATE", since, defaultPageable)).thenReturn(page);

            Page<AuditExpense> result = auditExpenseService.getAuditLogsByTypeAndTime(
                    "CREATE", since, defaultPageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("should search audit logs by text")
        void shouldSearchAuditLogs() {
            Page<AuditExpense> page = new PageImpl<>(List.of(testAuditExpense), defaultPageable, 1);
            when(auditExpenseRepository.searchAuditLogs("expense", defaultPageable)).thenReturn(page);

            Page<AuditExpense> result = auditExpenseService.searchAuditLogs("expense", defaultPageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("should search audit logs by text and type")
        void shouldSearchByType() {
            Page<AuditExpense> page = new PageImpl<>(List.of(testAuditExpense), defaultPageable, 1);
            when(auditExpenseRepository.searchAuditLogsByType("expense", "CREATE", defaultPageable))
                    .thenReturn(page);

            Page<AuditExpense> result = auditExpenseService.searchAuditLogsByType(
                    "expense", "CREATE", defaultPageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }
    }

    // ─── Statistics and counts ──────────────────────────────────────

    @Nested
    @DisplayName("Statistics and counts")
    class StatisticsTests {

        @Test
        @DisplayName("should return action type statistics")
        void shouldReturnActionTypeStatistics() {
            LocalDateTime since = LocalDateTime.now().minusDays(7);
            List<Object[]> stats = Arrays.asList(
                    new Object[]{"CREATE", 10L},
                    new Object[]{"UPDATE", 5L},
                    new Object[]{"DELETE", 2L}
            );
            when(auditExpenseRepository.getActionTypeStatisticsSince(since)).thenReturn(stats);

            List<Object[]> result = auditExpenseService.getActionTypeStatistics(since);

            assertThat(result).hasSize(3);
            assertThat(result.get(0)[0]).isEqualTo("CREATE");
            assertThat(result.get(0)[1]).isEqualTo(10L);
        }

        @Test
        @DisplayName("should count audit logs since timestamp")
        void shouldCountLogsSince() {
            LocalDateTime since = LocalDateTime.now().minusDays(7);
            when(auditExpenseRepository.countAuditLogsSince(since)).thenReturn(42L);

            Long result = auditExpenseService.countAuditLogsSince(since);

            assertThat(result).isEqualTo(42L);
        }

        @Test
        @DisplayName("should count by action type since timestamp")
        void shouldCountByActionTypeSince() {
            LocalDateTime since = LocalDateTime.now().minusDays(7);
            when(auditExpenseRepository.countByActionTypeSince("CREATE", since)).thenReturn(15L);

            Long result = auditExpenseService.countByActionTypeSince("CREATE", since);

            assertThat(result).isEqualTo(15L);
        }
    }
}
