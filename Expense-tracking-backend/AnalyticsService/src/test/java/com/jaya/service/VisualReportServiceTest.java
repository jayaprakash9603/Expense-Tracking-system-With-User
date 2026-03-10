package com.jaya.service;

import com.jaya.dto.report.VisualReportRequest;
import com.jaya.service.excel.VisualReportGenerator;
import com.jaya.testutil.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisualReportServiceTest {

    @Mock private AnalyticsExpenseClient expenseService;
    @Mock private BudgetClient budgetService;
    @Mock private BudgetAnalyticsClient budgetAnalyticsClient;
    @Mock private VisualReportGenerator reportGenerator;

    @InjectMocks
    private VisualReportService visualReportService;

    private static final String JWT = TestDataFactory.TEST_JWT;
    private static final Integer TARGET_ID = TestDataFactory.TEST_TARGET_ID;

    private void stubFeignClients() {
        when(expenseService.getExpenseSummary(eq(JWT), eq(TARGET_ID)))
                .thenReturn(TestDataFactory.buildExpenseSummary());
        when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), anyString(), eq(TARGET_ID)))
                .thenReturn(TestDataFactory.buildCategorizedExpenseData());
        when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                .thenReturn(TestDataFactory.buildBudgetReports());
    }

    // ─── generateVisualReport Tests ─────────────────────────────────

    @Nested
    @DisplayName("generateVisualReport")
    class GenerateVisualReportTests {

        @Test
        @DisplayName("should generate report and return ByteArrayInputStream")
        void shouldGenerateReport() throws IOException {
            stubFeignClients();
            ByteArrayInputStream expected = new ByteArrayInputStream(new byte[]{1, 2, 3});
            when(reportGenerator.generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean()))
                    .thenReturn(expected);

            VisualReportRequest request = TestDataFactory.buildDefaultVisualReportRequest();
            ByteArrayInputStream result = visualReportService.generateVisualReport(JWT, request);

            assertThat(result).isSameAs(expected);
            verify(reportGenerator).generateReport(any(), eq(true), eq(true), eq(true));
        }

        @Test
        @DisplayName("should default startDate to 3 months ago when null")
        void shouldDefaultStartDate() throws IOException {
            stubFeignClients();
            when(reportGenerator.generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean()))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            VisualReportRequest request = VisualReportRequest.builder()
                    .endDate(LocalDate.now())
                    .startDate(null)
                    .targetId(TARGET_ID)
                    .build();

            visualReportService.generateVisualReport(JWT, request);

            verify(reportGenerator).generateReport(
                    argThat(data -> data.getStartDate().equals(LocalDate.now().minusMonths(3))),
                    anyBoolean(), anyBoolean(), anyBoolean());
        }

        @Test
        @DisplayName("should default endDate to today when null")
        void shouldDefaultEndDate() throws IOException {
            stubFeignClients();
            when(reportGenerator.generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean()))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            VisualReportRequest request = VisualReportRequest.builder()
                    .startDate(null)
                    .endDate(null)
                    .targetId(TARGET_ID)
                    .build();

            visualReportService.generateVisualReport(JWT, request);

            verify(reportGenerator).generateReport(
                    argThat(data -> data.getEndDate().equals(LocalDate.now())),
                    anyBoolean(), anyBoolean(), anyBoolean());
        }

        @Test
        @DisplayName("should propagate IOException from report generator")
        void shouldPropagateIOException() throws IOException {
            stubFeignClients();
            when(reportGenerator.generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean()))
                    .thenThrow(new IOException("Failed to write workbook"));

            VisualReportRequest request = TestDataFactory.buildDefaultVisualReportRequest();

            assertThatThrownBy(() -> visualReportService.generateVisualReport(JWT, request))
                    .isInstanceOf(IOException.class)
                    .hasMessageContaining("Failed to write workbook");
        }
    }

    // ─── generateExpenseReport Tests ────────────────────────────────

    @Nested
    @DisplayName("generateExpenseReport")
    class GenerateExpenseReportTests {

        @Test
        @DisplayName("should build EXPENSE type request and delegate")
        void shouldBuildExpenseRequest() throws IOException {
            stubFeignClients();
            when(reportGenerator.generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean()))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            LocalDate start = LocalDate.of(2024, 1, 1);
            LocalDate end = LocalDate.of(2024, 3, 31);

            visualReportService.generateExpenseReport(JWT, start, end, TARGET_ID);

            verify(reportGenerator).generateReport(
                    argThat(data -> data.getStartDate().equals(start) && data.getEndDate().equals(end)),
                    eq(true), eq(true), eq(true));
        }
    }

    // ─── generateMonthlyReport Tests ────────────────────────────────

    @Nested
    @DisplayName("generateMonthlyReport")
    class GenerateMonthlyReportTests {

        @Test
        @DisplayName("should calculate correct date range for given month")
        void shouldCalculateMonthDateRange() throws IOException {
            stubFeignClients();
            when(reportGenerator.generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean()))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            visualReportService.generateMonthlyReport(JWT, 2024, 2, TARGET_ID);

            verify(reportGenerator).generateReport(
                    argThat(data ->
                            data.getStartDate().equals(LocalDate.of(2024, 2, 1)) &&
                            data.getEndDate().equals(LocalDate.of(2024, 2, 29))), // 2024 is leap year
                    eq(true), eq(true), eq(true));
        }
    }

    // ─── collectReportData Tests ────────────────────────────────────

    @Nested
    @DisplayName("collectReportData - data building")
    class CollectReportDataTests {

        @Test
        @DisplayName("should build ReportData with all sections populated")
        void shouldBuildCompleteReportData() throws IOException {
            stubFeignClients();
            when(reportGenerator.generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean()))
                    .thenAnswer(inv -> {
                        var data = inv.getArgument(0, com.jaya.dto.report.ReportData.class);
                        assertThat(data.getReportTitle()).isEqualTo("Expense Report");
                        assertThat(data.getGeneratedDate()).isEqualTo(LocalDate.now());
                        assertThat(data.getSummary()).isNotNull();
                        assertThat(data.getExpenses()).isNotNull();
                        assertThat(data.getCategoryBreakdown()).isNotNull();
                        assertThat(data.getMonthlyTrends()).isNotNull();
                        assertThat(data.getBudgets()).isNotNull();
                        assertThat(data.getInsights()).isNotNull();
                        return new ByteArrayInputStream(new byte[0]);
                    });

            VisualReportRequest request = TestDataFactory.buildDefaultVisualReportRequest();
            visualReportService.generateVisualReport(JWT, request);

            verify(reportGenerator).generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean());
        }

        @Test
        @DisplayName("should handle empty expense data gracefully")
        void shouldHandleEmptyExpenseData() throws IOException {
            when(expenseService.getExpenseSummary(eq(JWT), eq(TARGET_ID)))
                    .thenReturn(Collections.emptyMap());
            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), anyString(), eq(TARGET_ID)))
                    .thenReturn(Collections.emptyMap());
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());
            when(reportGenerator.generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean()))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            VisualReportRequest request = TestDataFactory.buildDefaultVisualReportRequest();
            ByteArrayInputStream result = visualReportService.generateVisualReport(JWT, request);

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("should handle feign client failure in expense data")
        void shouldHandleFeignFailure() throws IOException {
            when(expenseService.getExpenseSummary(eq(JWT), eq(TARGET_ID)))
                    .thenReturn(TestDataFactory.buildExpenseSummary());
            when(expenseService.getAllExpensesByCategoriesDetailed(eq(JWT), anyString(), anyString(), anyString(), eq(TARGET_ID)))
                    .thenThrow(new RuntimeException("Service down"));
            when(budgetAnalyticsClient.getAllBudgetReportsForUser(JWT, TARGET_ID))
                    .thenReturn(Collections.emptyList());
            when(reportGenerator.generateReport(any(), anyBoolean(), anyBoolean(), anyBoolean()))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            VisualReportRequest request = TestDataFactory.buildDefaultVisualReportRequest();

            // fetchExpenseData catches the exception internally and returns emptyMap
            ByteArrayInputStream result = visualReportService.generateVisualReport(JWT, request);
            assertThat(result).isNotNull();
        }
    }
}
