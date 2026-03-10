package com.jaya.service.excel;

import com.jaya.dto.report.ReportData;
import com.jaya.dto.report.ReportData.*;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.sheet.SheetCreator;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisualReportGeneratorTest {

    // ─── Helper builders ────────────────────────────────────────

    private ReportData buildMinimalReportData() {
        return ReportData.builder()
                .reportTitle("Test Report")
                .startDate(LocalDate.of(2024, 1, 1))
                .endDate(LocalDate.of(2024, 3, 31))
                .generatedDate(LocalDate.now())
                .userName("testUser")
                .summary(SummaryData.builder()
                        .totalExpenses(5000.0)
                        .totalIncome(10000.0)
                        .netBalance(5000.0)
                        .averageExpense(250.0)
                        .transactionCount(20)
                        .maxExpense(1000.0)
                        .minExpense(10.0)
                        .topCategory("Food")
                        .build())
                .expenses(List.of(
                        ExpenseRow.builder()
                                .id(1).name("Lunch").amount(500.0)
                                .category("Food").paymentMethod("UPI")
                                .date(LocalDate.of(2024, 2, 15))
                                .build()))
                .categoryBreakdown(List.of(
                        CategoryData.builder()
                                .categoryName("Food").totalAmount(3000.0)
                                .transactionCount(15).percentage(60.0)
                                .build(),
                        CategoryData.builder()
                                .categoryName("Transport").totalAmount(2000.0)
                                .transactionCount(5).percentage(40.0)
                                .build()))
                .monthlyTrends(List.of(
                        MonthlyTrendData.builder()
                                .month("January").year(2024).monthNumber(1)
                                .totalAmount(1500.0).transactionCount(8)
                                .build()))
                .dailySpending(List.of(
                        DailySpendingData.builder()
                                .date(LocalDate.of(2024, 2, 15))
                                .dayName("Thursday").amount(500.0)
                                .transactionCount(2).topCategory("Food")
                                .build()))
                .budgets(List.of(
                        BudgetData.builder()
                                .budgetId(1).budgetName("Monthly Budget")
                                .allocatedAmount(5000.0).usedAmount(3000.0)
                                .remainingAmount(2000.0).utilizationPercent(60.0)
                                .startDate(LocalDate.of(2024, 1, 1))
                                .endDate(LocalDate.of(2024, 1, 31))
                                .status("ACTIVE").isValid(true)
                                .build()))
                .paymentMethods(List.of(
                        PaymentMethodData.builder()
                                .methodName("UPI").displayName("UPI")
                                .totalAmount(3000.0).transactionCount(15)
                                .percentage(60.0)
                                .build()))
                .topExpenses(List.of(
                        TopExpenseData.builder()
                                .id(1).name("Big Purchase").amount(1000.0)
                                .date(LocalDate.of(2024, 2, 1)).rank(1)
                                .category("Shopping")
                                .build()))
                .insights(List.of(
                        InsightData.builder()
                                .type("INFO").title("Consistent Spending")
                                .message("You spent consistently this month")
                                .build()))
                .build();
    }

    // ─── generateReport Tests ───────────────────────────────────

    @Nested
    @DisplayName("generateReport")
    class GenerateReportTests {

        @Test
        @DisplayName("should produce valid xlsx bytes with no sheet creators")
        void shouldProduceValidXlsxWithNoCreators() throws IOException {
            VisualReportGenerator generator = new VisualReportGenerator(List.of());

            ByteArrayInputStream result = generator.generateReport(
                    buildMinimalReportData(), false, false, false);

            assertThat(result).isNotNull();
            try (XSSFWorkbook wb = new XSSFWorkbook(result)) {
                assertThat(wb.getNumberOfSheets()).isZero();
            }
        }

        @Test
        @DisplayName("should invoke sheet creators in order")
        void shouldInvokeCreatorsInOrder() throws IOException {
            List<Integer> invocationOrder = new ArrayList<>();

            SheetCreator first = createStubCreator("First", 1, true, invocationOrder);
            SheetCreator second = createStubCreator("Second", 2, true, invocationOrder);
            SheetCreator third = createStubCreator("Third", 3, true, invocationOrder);

            VisualReportGenerator generator = new VisualReportGenerator(
                    List.of(third, first, second));

            generator.generateReport(buildMinimalReportData(), true, true, true);

            assertThat(invocationOrder).containsExactly(1, 2, 3);
        }

        @Test
        @DisplayName("should skip creators whose shouldCreate returns false")
        void shouldSkipCreatorsWithFalseShouldCreate() throws IOException {
            List<Integer> invocationOrder = new ArrayList<>();

            SheetCreator included = createStubCreator("Included", 1, true, invocationOrder);
            SheetCreator skipped = createStubCreator("Skipped", 2, false, invocationOrder);

            VisualReportGenerator generator = new VisualReportGenerator(
                    List.of(included, skipped));

            generator.generateReport(buildMinimalReportData(), true, true, true);

            assertThat(invocationOrder).containsExactly(1);
        }

        @Test
        @DisplayName("should apply fit-to-page print settings")
        void shouldApplyViewSettings() throws IOException {
            SheetCreator creator = new SheetCreator() {
                @Override
                public String getSheetName() { return "TestSheet"; }
                @Override
                public int getOrder() { return 1; }
                @Override
                public boolean shouldCreate(SheetContext ctx) { return true; }
                @Override
                public void create(SheetContext ctx) {
                    ctx.getWorkbook().createSheet(getSheetName());
                }
            };

            VisualReportGenerator generator = new VisualReportGenerator(List.of(creator));

            ByteArrayInputStream result = generator.generateReport(
                    buildMinimalReportData(), false, false, false);

            try (XSSFWorkbook wb = new XSSFWorkbook(result)) {
                XSSFSheet sheet = wb.getSheet("TestSheet");
                assertThat(sheet).isNotNull();
                assertThat(sheet.getFitToPage()).isTrue();
                assertThat(sheet.getPrintSetup().getFitWidth()).isEqualTo((short) 1);
                assertThat(sheet.getPrintSetup().getFitHeight()).isEqualTo((short) 0);
            }
        }

        @Test
        @DisplayName("should pass context flags to sheet creators")
        void shouldPassContextFlags() throws IOException {
            boolean[] capturedFlags = new boolean[3];

            SheetCreator flagCaptor = new SheetCreator() {
                @Override
                public String getSheetName() { return "FlagCheck"; }
                @Override
                public int getOrder() { return 1; }
                @Override
                public boolean shouldCreate(SheetContext ctx) { return true; }
                @Override
                public void create(SheetContext ctx) {
                    capturedFlags[0] = ctx.isIncludeCharts();
                    capturedFlags[1] = ctx.isIncludeFormulas();
                    capturedFlags[2] = ctx.isIncludeConditionalFormatting();
                    ctx.getWorkbook().createSheet(getSheetName());
                }
            };

            VisualReportGenerator generator = new VisualReportGenerator(List.of(flagCaptor));
            generator.generateReport(buildMinimalReportData(), true, false, true);

            assertThat(capturedFlags[0]).isTrue();
            assertThat(capturedFlags[1]).isFalse();
            assertThat(capturedFlags[2]).isTrue();
        }

        @Test
        @DisplayName("should produce parseable xlsx output stream")
        void shouldProduceParseableXlsx() throws IOException {
            SheetCreator creator = new SheetCreator() {
                @Override
                public String getSheetName() { return "DataSheet"; }
                @Override
                public int getOrder() { return 1; }
                @Override
                public boolean shouldCreate(SheetContext ctx) { return true; }
                @Override
                public void create(SheetContext ctx) {
                    var sheet = ctx.getWorkbook().createSheet(getSheetName());
                    var row = sheet.createRow(0);
                    row.createCell(0).setCellValue("Test Value");
                    row.createCell(1).setCellValue(42.0);
                }
            };

            VisualReportGenerator generator = new VisualReportGenerator(List.of(creator));

            ByteArrayInputStream result = generator.generateReport(
                    buildMinimalReportData(), false, false, false);

            try (XSSFWorkbook wb = new XSSFWorkbook(result)) {
                XSSFSheet sheet = wb.getSheet("DataSheet");
                assertThat(sheet).isNotNull();
                assertThat(sheet.getRow(0).getCell(0).getStringCellValue())
                        .isEqualTo("Test Value");
                assertThat(sheet.getRow(0).getCell(1).getNumericCellValue())
                        .isEqualTo(42.0);
            }
        }
    }

    // ─── Helper ─────────────────────────────────────────────────

    private SheetCreator createStubCreator(String name, int order,
                                            boolean shouldCreate,
                                            List<Integer> invocationTracker) {
        return new SheetCreator() {
            @Override
            public String getSheetName() { return name; }
            @Override
            public int getOrder() { return order; }
            @Override
            public boolean shouldCreate(SheetContext ctx) { return shouldCreate; }
            @Override
            public void create(SheetContext ctx) {
                invocationTracker.add(order);
                ctx.getWorkbook().createSheet(name);
            }
        };
    }
}
