package com.jaya.testutil;

import com.jaya.dto.AdminReportDTO;
import com.jaya.dto.GenerateReportRequest;
import com.jaya.dto.UnifiedActivityEventDTO;
import com.jaya.models.AdminReport;
import com.jaya.models.AuditEvent;
import com.jaya.models.AuditExpense;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class AuditTestDataFactory {

    public static final String TEST_JWT = "Bearer test-jwt-token";
    public static final Integer TEST_USER_ID = 1;
    public static final String TEST_USERNAME = "testuser";
    public static final String TEST_USER_ROLE = "USER";
    public static final String TEST_CORRELATION_ID = "corr-12345";
    public static final String TEST_IP_ADDRESS = "192.168.1.100";
    public static final String TEST_SESSION_ID = "session-abc-123";
    public static final String TEST_SERVICE_NAME = "expense-service";

    // ─── AuditEvent builders ────────────────────────────────────────

    public static AuditEvent buildAuditEvent() {
        return AuditEvent.builder()
                .userId(TEST_USER_ID)
                .username(TEST_USERNAME)
                .userRole(TEST_USER_ROLE)
                .entityId("100")
                .entityType("EXPENSE")
                .actionType("CREATE")
                .details("Created new expense")
                .description("User created expense #100")
                .timestamp(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(TEST_USERNAME)
                .lastUpdatedBy(TEST_USERNAME)
                .ipAddress(TEST_IP_ADDRESS)
                .userAgent("Mozilla/5.0")
                .sessionId(TEST_SESSION_ID)
                .correlationId(TEST_CORRELATION_ID)
                .requestId("req-001")
                .serviceName(TEST_SERVICE_NAME)
                .serviceVersion("1.0.0")
                .environment("test")
                .status("SUCCESS")
                .responseCode(200)
                .source("API")
                .method("POST")
                .endpoint("/api/expenses")
                .executionTimeMs(150L)
                .oldValues(buildOldValues())
                .newValues(buildNewValues())
                .build();
    }

    public static AuditEvent buildFailedLoginEvent() {
        return AuditEvent.builder()
                .userId(TEST_USER_ID)
                .username(TEST_USERNAME)
                .entityId("1")
                .entityType("USER")
                .actionType("LOGIN")
                .details("Failed login attempt")
                .status("FAILURE")
                .ipAddress(TEST_IP_ADDRESS)
                .timestamp(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .correlationId("corr-login-fail")
                .build();
    }

    public static AuditEvent buildExpenseCreateEvent() {
        return AuditEvent.builder()
                .userId(TEST_USER_ID)
                .username(TEST_USERNAME)
                .entityId("200")
                .entityType("EXPENSE")
                .actionType("CREATE")
                .details("New expense created")
                .status("SUCCESS")
                .timestamp(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .correlationId("corr-expense-create")
                .build();
    }

    // ─── AuditExpense builders ──────────────────────────────────────

    public static AuditExpense buildAuditExpense() {
        return AuditExpense.builder()
                .id(1L)
                .userId(TEST_USER_ID)
                .username(TEST_USERNAME)
                .userRole(TEST_USER_ROLE)
                .entityId("100")
                .entityType("EXPENSE")
                .actionType("CREATE")
                .details("Created new expense")
                .description("User created expense #100")
                .timestamp(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(TEST_USERNAME)
                .lastUpdatedBy(TEST_USERNAME)
                .ipAddress(TEST_IP_ADDRESS)
                .userAgent("Mozilla/5.0")
                .sessionId(TEST_SESSION_ID)
                .correlationId(TEST_CORRELATION_ID)
                .requestId("req-001")
                .serviceName(TEST_SERVICE_NAME)
                .serviceVersion("1.0.0")
                .environment("test")
                .status("SUCCESS")
                .responseCode(200)
                .source("API")
                .method("POST")
                .endpoint("/api/expenses")
                .executionTimeMs(150L)
                .expenseId(100)
                .build();
    }

    public static AuditExpense buildAuditExpenseWithoutId() {
        AuditExpense expense = buildAuditExpense();
        expense.setId(null);
        return expense;
    }

    // ─── AdminReport builders ───────────────────────────────────────

    public static AdminReport buildAdminReport() {
        return AdminReport.builder()
                .id(1L)
                .name("Test Report")
                .type("expense-summary")
                .dateRange("2024-01-01 to 2024-12-31")
                .format("PDF")
                .status("COMPLETED")
                .size("2.5 MB")
                .downloadUrl("/api/admin/reports/1/download")
                .createdAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .generatedBy(1L)
                .generatedByUsername("admin")
                .build();
    }

    public static AdminReport buildGeneratingReport() {
        return AdminReport.builder()
                .id(2L)
                .name("Generating Report")
                .type("audit-trail")
                .dateRange("last-30-days")
                .format("CSV")
                .status("GENERATING")
                .createdAt(LocalDateTime.now())
                .generatedBy(1L)
                .generatedByUsername("admin")
                .build();
    }

    public static AdminReportDTO buildAdminReportDTO() {
        return AdminReportDTO.builder()
                .id(1L)
                .name("Test Report")
                .type("expense-summary")
                .dateRange("2024-01-01 to 2024-12-31")
                .format("PDF")
                .status("COMPLETED")
                .size("2.5 MB")
                .downloadUrl("/api/admin/reports/1/download")
                .createdAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .generatedBy(1L)
                .generatedByUsername("admin")
                .build();
    }

    public static GenerateReportRequest buildGenerateReportRequest() {
        return GenerateReportRequest.builder()
                .type("expense-summary")
                .dateRange("2024-01-01 to 2024-12-31")
                .format("PDF")
                .name("My Report")
                .build();
    }

    // ─── UnifiedActivityEventDTO builder ────────────────────────────

    public static UnifiedActivityEventDTO buildUnifiedActivityEvent() {
        return UnifiedActivityEventDTO.builder()
                .eventId("event-001")
                .timestamp(LocalDateTime.now())
                .actorUserId(TEST_USER_ID)
                .actorUserName(TEST_USERNAME)
                .actorRole(TEST_USER_ROLE)
                .entityType("EXPENSE")
                .entityId(100L)
                .entityName("Grocery Shopping")
                .action("CREATE")
                .description("Created expense")
                .amount(50.0)
                .sourceService(TEST_SERVICE_NAME)
                .serviceVersion("1.0.0")
                .environment("test")
                .ipAddress(TEST_IP_ADDRESS)
                .sessionId(TEST_SESSION_ID)
                .correlationId(TEST_CORRELATION_ID)
                .status("SUCCESS")
                .responseCode(200)
                .httpMethod("POST")
                .endpoint("/api/expenses")
                .executionTimeMs(100L)
                .requiresAudit(true)
                .requiresNotification(true)
                .build();
    }

    public static UnifiedActivityEventDTO buildNonAuditUnifiedEvent() {
        UnifiedActivityEventDTO event = buildUnifiedActivityEvent();
        event.setRequiresAudit(false);
        return event;
    }

    // ─── Helper maps ────────────────────────────────────────────────

    public static Map<String, Object> buildOldValues() {
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("amount", 100.0);
        oldValues.put("category", "Food");
        return oldValues;
    }

    public static Map<String, Object> buildNewValues() {
        Map<String, Object> newValues = new HashMap<>();
        newValues.put("amount", 150.0);
        newValues.put("category", "Groceries");
        return newValues;
    }
}
