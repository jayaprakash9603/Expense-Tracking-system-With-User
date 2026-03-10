package com.jaya.controller;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.models.AuditExpense;
import com.jaya.service.AuditExpenseService;
import com.jaya.service.EmailService;
import com.jaya.testutil.AuditTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuditExpenseControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditExpenseService auditExpenseService;

    @MockBean
    private IUserServiceClient userServiceClient;

    @MockBean
    private EmailService emailService;

    @MockBean
    private JavaMailSender javaMailSender;

    private static final String TEST_JWT = "Bearer test-jwt-token";
    private UserDTO testUser;
    private AuditExpense testAuditExpense;

    @BeforeEach
    void setUp() {
        testUser = new UserDTO();
        testUser.setId(1);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testAuditExpense = AuditTestDataFactory.buildAuditExpense();
    }

    // ─── GET /api/audit-logs/all ────────────────────────────────────

    @Nested
    @DisplayName("GET /api/audit-logs/all")
    class GetAllAuditLogsTests {

        @Test
        @DisplayName("should return audit logs for authenticated user")
        void shouldReturnAuditLogs() throws Exception {
            when(userServiceClient.getUserProfile(TEST_JWT)).thenReturn(testUser);
            when(auditExpenseService.getAllAuditLogs(1))
                    .thenReturn(List.of(testAuditExpense));

            mockMvc.perform(get("/api/audit-logs/all")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("should return 204 when no audit logs exist")
        void shouldReturn204WhenEmpty() throws Exception {
            when(userServiceClient.getUserProfile(TEST_JWT)).thenReturn(testUser);
            when(auditExpenseService.getAllAuditLogs(1))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/audit-logs/all")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("should return 401 when user profile is null")
        void shouldReturn401WhenUserIsNull() throws Exception {
            when(userServiceClient.getUserProfile(TEST_JWT)).thenReturn(null);

            mockMvc.perform(get("/api/audit-logs/all")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 500 when service throws exception")
        void shouldReturn500OnServiceError() throws Exception {
            when(userServiceClient.getUserProfile(TEST_JWT)).thenReturn(testUser);
            when(auditExpenseService.getAllAuditLogs(1))
                    .thenThrow(new RuntimeException("DB error"));

            mockMvc.perform(get("/api/audit-logs/all")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isInternalServerError());
        }
    }

    // ─── GET /api/audit-logs/audit-types ────────────────────────────

    @Nested
    @DisplayName("GET /api/audit-logs/audit-types")
    class GetAuditTypesTests {

        @Test
        @DisplayName("should return all 19 audit types")
        void shouldReturnAllAuditTypes() throws Exception {
            mockMvc.perform(get("/api/audit-logs/audit-types"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(19)))
                    .andExpect(jsonPath("$[0]").value("Current Month Logs"))
                    .andExpect(jsonPath("$[17]").value("All Audit Logs"))
                    .andExpect(jsonPath("$[18]").value("Logs by Expense ID"));
        }
    }
}
