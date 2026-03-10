package com.jaya.controller;

import com.jaya.models.AuditExpense;
import com.jaya.service.AuditExpenseService;
import com.jaya.testutil.AuditTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminAuditControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditExpenseService auditExpenseService;

    @MockBean
    private JavaMailSender javaMailSender;

    private AuditExpense testAuditExpense;

    @BeforeEach
    void setUp() {
        testAuditExpense = AuditTestDataFactory.buildAuditExpense();
    }

    // ─── GET /api/admin/audit-logs ──────────────────────────────────

    @Nested
    @DisplayName("GET /api/admin/audit-logs")
    class GetAllAuditLogsTests {

        @Test
        @DisplayName("should return paginated audit logs with default params")
        void shouldReturnPaginatedAuditLogs() throws Exception {
            Page<AuditExpense> page = new PageImpl<>(
                    List.of(testAuditExpense), PageRequest.of(0, 20), 1);
            when(auditExpenseService.getAuditLogsSince(any(LocalDateTime.class), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/admin/audit-logs"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.currentPage").value(0))
                    .andExpect(jsonPath("$.totalItems").value(1))
                    .andExpect(jsonPath("$.totalPages").value(1));
        }

        @Test
        @DisplayName("should filter by actionType")
        void shouldFilterByActionType() throws Exception {
            Page<AuditExpense> page = new PageImpl<>(
                    List.of(testAuditExpense), PageRequest.of(0, 20), 1);
            when(auditExpenseService.getAuditLogsByTypeAndTime(eq("CREATE"), any(LocalDateTime.class), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/admin/audit-logs")
                            .param("actionType", "CREATE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("should search audit logs by text")
        void shouldSearchAuditLogs() throws Exception {
            Page<AuditExpense> page = new PageImpl<>(
                    List.of(testAuditExpense), PageRequest.of(0, 20), 1);
            when(auditExpenseService.searchAuditLogs(eq("expense"), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/admin/audit-logs")
                            .param("search", "expense"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("should search with actionType filter")
        void shouldSearchWithActionType() throws Exception {
            Page<AuditExpense> page = new PageImpl<>(
                    List.of(testAuditExpense), PageRequest.of(0, 20), 1);
            when(auditExpenseService.searchAuditLogsByType(eq("expense"), eq("CREATE"), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/admin/audit-logs")
                            .param("search", "expense")
                            .param("actionType", "CREATE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("should handle timeRange=all")
        void shouldHandleTimeRangeAll() throws Exception {
            Page<AuditExpense> page = new PageImpl<>(
                    List.of(testAuditExpense), PageRequest.of(0, 20), 1);
            when(auditExpenseService.getAllAuditLogsPaginated(any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/admin/audit-logs")
                            .param("timeRange", "all"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("should handle actionType=all like no filter")
        void shouldHandleActionTypeAll() throws Exception {
            Page<AuditExpense> page = new PageImpl<>(
                    List.of(testAuditExpense), PageRequest.of(0, 20), 1);
            when(auditExpenseService.getAuditLogsSince(any(LocalDateTime.class), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/admin/audit-logs")
                            .param("actionType", "all"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("should return 500 when service throws exception")
        void shouldReturn500OnServiceError() throws Exception {
            when(auditExpenseService.getAuditLogsSince(any(LocalDateTime.class), any()))
                    .thenThrow(new RuntimeException("Database error"));

            mockMvc.perform(get("/api/admin/audit-logs"))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.error").value("Failed to fetch audit logs"));
        }

        @Test
        @DisplayName("should support custom page and size params")
        void shouldSupportCustomPagination() throws Exception {
            Page<AuditExpense> page = new PageImpl<>(
                    List.of(testAuditExpense), PageRequest.of(2, 5), 15);
            when(auditExpenseService.getAuditLogsSince(any(LocalDateTime.class), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/admin/audit-logs")
                            .param("page", "2")
                            .param("size", "5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentPage").value(2))
                    .andExpect(jsonPath("$.size").value(5));
        }

        @Test
        @DisplayName("should handle 24h time range")
        void shouldHandle24hTimeRange() throws Exception {
            Page<AuditExpense> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
            when(auditExpenseService.getAuditLogsSince(any(LocalDateTime.class), any()))
                    .thenReturn(page);

            mockMvc.perform(get("/api/admin/audit-logs")
                            .param("timeRange", "24h"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }
    }

    // ─── GET /api/admin/audit-logs/stats ────────────────────────────

    @Nested
    @DisplayName("GET /api/admin/audit-logs/stats")
    class GetAuditStatsTests {

        @Test
        @DisplayName("should return audit statistics")
        void shouldReturnAuditStats() throws Exception {
            List<Object[]> stats = Arrays.asList(
                    new Object[]{"CREATE", 10L},
                    new Object[]{"LOGIN", 5L},
                    new Object[]{"DELETE", 2L}
            );
            when(auditExpenseService.countAuditLogsSince(any(LocalDateTime.class))).thenReturn(17L);
            when(auditExpenseService.getActionTypeStatistics(any(LocalDateTime.class))).thenReturn(stats);

            mockMvc.perform(get("/api/admin/audit-logs/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalLogs").value(17))
                    .andExpect(jsonPath("$.timeRange").value("7d"))
                    .andExpect(jsonPath("$.statsByType.CREATE").value(10))
                    .andExpect(jsonPath("$.statsByType.LOGIN").value(5));
        }

        @Test
        @DisplayName("should aggregate authentication stats")
        void shouldAggregateAuthStats() throws Exception {
            List<Object[]> stats = Arrays.asList(
                    new Object[]{"LOGIN", 5L},
                    new Object[]{"LOGOUT", 3L},
                    new Object[]{"AUTHENTICATION", 2L}
            );
            when(auditExpenseService.countAuditLogsSince(any(LocalDateTime.class))).thenReturn(10L);
            when(auditExpenseService.getActionTypeStatistics(any(LocalDateTime.class))).thenReturn(stats);

            mockMvc.perform(get("/api/admin/audit-logs/stats"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.authentication").value(10));
        }

        @Test
        @DisplayName("should return 500 on service error")
        void shouldReturn500OnError() throws Exception {
            when(auditExpenseService.countAuditLogsSince(any(LocalDateTime.class)))
                    .thenThrow(new RuntimeException("Error"));

            mockMvc.perform(get("/api/admin/audit-logs/stats"))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.error").value("Failed to fetch audit statistics"));
        }

        @Test
        @DisplayName("should handle custom time range")
        void shouldHandleCustomTimeRange() throws Exception {
            when(auditExpenseService.countAuditLogsSince(any(LocalDateTime.class))).thenReturn(0L);
            when(auditExpenseService.getActionTypeStatistics(any(LocalDateTime.class)))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/admin/audit-logs/stats")
                            .param("timeRange", "30d"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalLogs").value(0))
                    .andExpect(jsonPath("$.timeRange").value("30d"));
        }
    }

    // ─── GET /api/admin/audit-logs/user/{userId} ────────────────────

    @Nested
    @DisplayName("GET /api/admin/audit-logs/user/{userId}")
    class GetUserAuditLogsTests {

        @Test
        @DisplayName("should return paginated audit logs for user")
        void shouldReturnUserAuditLogs() throws Exception {
            Page<AuditExpense> page = new PageImpl<>(
                    List.of(testAuditExpense), PageRequest.of(0, 20), 1);
            when(auditExpenseService.getAuditTrailForUser(eq(1), any())).thenReturn(page);

            mockMvc.perform(get("/api/admin/audit-logs/user/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.userId").value(1));
        }

        @Test
        @DisplayName("should return 500 on service error")
        void shouldReturn500OnError() throws Exception {
            when(auditExpenseService.getAuditTrailForUser(eq(1), any()))
                    .thenThrow(new RuntimeException("Error"));

            mockMvc.perform(get("/api/admin/audit-logs/user/1"))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.error").value("Failed to fetch user audit logs"));
        }
    }

    // ─── GET /api/admin/audit-logs/entity ───────────────────────────

    @Nested
    @DisplayName("GET /api/admin/audit-logs/entity")
    class GetEntityAuditLogsTests {

        @Test
        @DisplayName("should return audit logs for specific entity")
        void shouldReturnEntityAuditLogs() throws Exception {
            when(auditExpenseService.getAuditTrailForEntity("EXPENSE", "100"))
                    .thenReturn(List.of(testAuditExpense));

            mockMvc.perform(get("/api/admin/audit-logs/entity")
                            .param("entityType", "EXPENSE")
                            .param("entityId", "100"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.entityType").value("EXPENSE"))
                    .andExpect(jsonPath("$.entityId").value("100"));
        }

        @Test
        @DisplayName("should return 500 on service error")
        void shouldReturn500OnError() throws Exception {
            when(auditExpenseService.getAuditTrailForEntity("EXPENSE", "100"))
                    .thenThrow(new RuntimeException("Error"));

            mockMvc.perform(get("/api/admin/audit-logs/entity")
                            .param("entityType", "EXPENSE")
                            .param("entityId", "100"))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.error").value("Failed to fetch entity audit logs"));
        }
    }
}
