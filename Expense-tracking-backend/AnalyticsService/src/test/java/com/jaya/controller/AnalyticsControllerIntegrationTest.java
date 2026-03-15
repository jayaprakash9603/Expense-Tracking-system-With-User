package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.dto.AnalyticsEntityType;
import com.jaya.dto.AnalyticsRequestDTO;
import com.jaya.service.*;
import com.jaya.testutil.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private AnalyticsExpenseClient expenseClient;
    @MockBean private BudgetAnalyticsClient budgetAnalyticsClient;
    @MockBean private BudgetClient budgetClient;
    @MockBean private FriendshipAnalyticsClient friendshipClient;
    @MockBean private GroupAnalyticsClient groupClient;
    @MockBean private CategoryAnalyticsClient categoryClient;
    @MockBean private PaymentMethodAnalyticsClient paymentMethodClient;
    @MockBean private BillAnalyticsClient billClient;
    @MockBean private JavaMailSender javaMailSender;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    private static final String JWT = TestDataFactory.TEST_JWT;

    // ─── Overview Endpoint Integration Tests ──────────────────────

    @Nested
    @DisplayName("GET /api/analytics/overview - Integration")
    class OverviewIntegrationTests {

        @Test
        @DisplayName("should aggregate data from all services and return 200")
        void shouldAggregateAllServices() throws Exception {
            when(expenseClient.getExpenseSummary(eq(JWT), any()))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(eq(JWT), any()))
                    .thenReturn(TestDataFactory.buildBudgetReports());
            when(friendshipClient.getFriendshipStats(JWT))
                    .thenReturn(TestDataFactory.buildFriendshipStats());
            when(groupClient.getAllUserGroups(JWT))
                    .thenReturn(TestDataFactory.buildGroupsList(5));
            when(groupClient.getGroupsCreatedByUser(JWT))
                    .thenReturn(TestDataFactory.buildGroupsList(2));
            when(groupClient.getGroupsWhereUserIsMember(JWT))
                    .thenReturn(TestDataFactory.buildGroupsList(3));

            mockMvc.perform(get("/api/analytics/overview")
                            .header("Authorization", JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalExpenses").value(5000.0))
                    .andExpect(jsonPath("$.friendsCount").value(12))
                    .andExpect(jsonPath("$.totalGroups").value(5))
                    .andExpect(jsonPath("$.groupsCreated").value(2))
                    .andExpect(jsonPath("$.groupsMember").value(3));
        }

        @Test
        @DisplayName("should handle service failures gracefully returning partial data")
        void shouldReturnPartialDataOnServiceFailure() throws Exception {
            when(expenseClient.getExpenseSummary(eq(JWT), any()))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(eq(JWT), any()))
                    .thenThrow(new RuntimeException("Budget service down"));
            when(friendshipClient.getFriendshipStats(JWT))
                    .thenThrow(new RuntimeException("Friendship service down"));
            when(groupClient.getAllUserGroups(JWT))
                    .thenReturn(Collections.emptyList());
            when(groupClient.getGroupsCreatedByUser(JWT))
                    .thenReturn(Collections.emptyList());
            when(groupClient.getGroupsWhereUserIsMember(JWT))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/analytics/overview")
                            .header("Authorization", JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalExpenses").value(5000.0))
                    .andExpect(jsonPath("$.totalGroups").value(0));
        }

        @Test
        @DisplayName("should pass targetId when provided")
        void shouldPassTargetId() throws Exception {
            when(expenseClient.getExpenseSummary(JWT, 42))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, 42))
                    .thenReturn(TestDataFactory.buildBudgetReports());
            when(friendshipClient.getFriendshipStats(JWT))
                    .thenReturn(TestDataFactory.buildFriendshipStats());
            when(groupClient.getAllUserGroups(JWT))
                    .thenReturn(TestDataFactory.buildGroupsList(3));
            when(groupClient.getGroupsCreatedByUser(JWT))
                    .thenReturn(TestDataFactory.buildGroupsList(1));
            when(groupClient.getGroupsWhereUserIsMember(JWT))
                    .thenReturn(TestDataFactory.buildGroupsList(2));

            mockMvc.perform(get("/api/analytics/overview")
                            .header("Authorization", JWT)
                            .param("targetId", "42"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalExpenses").value(5000.0));
        }
    }

    // ─── Entity Analytics Endpoint Integration Tests ────────────

    @Nested
    @DisplayName("POST /api/analytics/entity - Integration")
    class EntityAnalyticsIntegrationTests {

        @Test
        @DisplayName("should return category analytics end-to-end")
        void shouldReturnCategoryAnalytics() throws Exception {
            when(expenseClient.getAllExpensesByCategoriesDetailed(eq(JWT), any(), any(), any(), any()))
                    .thenReturn(TestDataFactory.buildCategoryExpensesResponse());
            when(budgetClient.getAllBudgets(eq(JWT), any()))
                    .thenReturn(TestDataFactory.buildBudgetReports());

            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .startDate(LocalDate.of(2024, 1, 1))
                    .endDate(LocalDate.of(2024, 6, 30))
                    .trendType("MONTHLY")
                    .build();

            mockMvc.perform(post("/api/analytics/entity")
                            .header("Authorization", JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.categoryMetadata.categoryName").value("Food"))
                    .andExpect(jsonPath("$.summaryStatistics").isNotEmpty());
        }

        @Test
        @DisplayName("should default dates when not provided")
        void shouldDefaultDates() throws Exception {
            when(expenseClient.getAllExpensesByCategoriesDetailed(eq(JWT), any(), any(), any(), any()))
                    .thenReturn(TestDataFactory.buildCategoryExpensesResponse());
            when(budgetClient.getAllBudgets(eq(JWT), any()))
                    .thenReturn(TestDataFactory.buildBudgetReports());

            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .build();

            mockMvc.perform(post("/api/analytics/entity")
                            .header("Authorization", JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.categoryMetadata.categoryName").value("Food"));
        }

        @Test
        @DisplayName("should return payment method analytics")
        void shouldReturnPaymentMethodAnalytics() throws Exception {
            when(paymentMethodClient.getPaymentMethodById(eq(JWT), eq(5), any()))
                    .thenReturn(TestDataFactory.buildPaymentMethodById());
            when(expenseClient.getAllExpensesByPaymentMethodDetailed(eq(JWT), any(), any(), any(), any()))
                    .thenReturn(TestDataFactory.buildCategoryExpensesResponse());
            when(budgetClient.getAllBudgets(eq(JWT), any()))
                    .thenReturn(TestDataFactory.buildBudgetReports());

            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.PAYMENT_METHOD)
                    .entityId(5)
                    .trendType("MONTHLY")
                    .build();

            mockMvc.perform(post("/api/analytics/entity")
                            .header("Authorization", JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }

    // ─── Report Download Endpoint Integration Tests ─────────────

    @Nested
    @DisplayName("GET /api/analytics/report/excel - Integration")
    class ReportIntegrationTests {

        @BeforeEach
        void stubFeignClients() {
            when(expenseClient.getExpenseSummary(eq(JWT), any()))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(expenseClient.getAllExpensesByCategoriesDetailed(eq(JWT), any(), any(), any(), any()))
                    .thenReturn(TestDataFactory.buildCategoryExpensesResponse());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(eq(JWT), any()))
                    .thenReturn(TestDataFactory.buildBudgetReports());
        }

        @Test
        @DisplayName("should return xlsx file with content-disposition header")
        void shouldReturnXlsxFile() throws Exception {
            mockMvc.perform(get("/api/analytics/report/excel")
                            .header("Authorization", JWT)
                            .param("startDate", "2024-01-01")
                            .param("endDate", "2024-03-31"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition",
                            containsString("expense_report_")))
                    .andExpect(header().string("Content-Disposition",
                            containsString(".xlsx")))
                    .andExpect(content().contentType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        }

        @Test
        @DisplayName("should use allTime date range")
        void shouldUseAllTimeDateRange() throws Exception {
            mockMvc.perform(get("/api/analytics/report/excel")
                            .header("Authorization", JWT)
                            .param("allTime", "true"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition",
                            containsString("all_time")));
        }

        @Test
        @DisplayName("should use year/month params")
        void shouldUseYearMonthParams() throws Exception {
            mockMvc.perform(get("/api/analytics/report/excel")
                            .header("Authorization", JWT)
                            .param("year", "2024")
                            .param("month", "6"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition",
                            containsString("20240601_to_20240630")));
        }

        @Test
        @DisplayName("should default to 3-month range when no dates provided")
        void shouldDefaultToThreeMonthRange() throws Exception {
            mockMvc.perform(get("/api/analytics/report/excel")
                            .header("Authorization", JWT))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Content-Disposition",
                            containsString("expense_report_")));
        }
    }
}
