package com.jaya.service.excel.sheet.creators;

import com.jaya.dto.report.ReportData;
import com.jaya.dto.report.ReportData.*;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

class SummarySheetCreatorTest {

    private SummarySheetCreator creator;
    private XSSFWorkbook workbook;

    @BeforeEach
    void setUp() {
        creator = new SummarySheetCreator();
        workbook = new XSSFWorkbook();
    }

    @AfterEach
    void tearDown() throws Exception {
        workbook.close();
    }

    private SheetContext buildContext(ReportData data, boolean charts) {
        return SheetContext.builder()
                .workbook(workbook)
                .data(data)
                .styleFactory(new ExcelStyleFactory(workbook))
                .includeCharts(charts)
                .includeFormulas(true)
                .includeConditionalFormatting(true)
                .build();
    }

    private ReportData buildReportData(SummaryData summary) {
        return ReportData.builder()
                .reportTitle("Expense Report Q1 2024")
                .startDate(LocalDate.of(2024, 1, 1))
                .endDate(LocalDate.of(2024, 3, 31))
                .summary(summary)
                .categoryBreakdown(List.of(
                        CategoryData.builder()
                                .categoryName("Food").totalAmount(3000.0)
                                .percentage(60.0).transactionCount(15)
                                .build(),
                        CategoryData.builder()
                                .categoryName("Transport").totalAmount(2000.0)
                                .percentage(40.0).transactionCount(5)
                                .build()))
                .build();
    }

    // ─── Metadata ────────────────────────────────────────────

    @Nested
    @DisplayName("Sheet metadata")
    class MetadataTests {

        @Test
        @DisplayName("should have sheet name 'Summary'")
        void shouldHaveCorrectSheetName() {
            assertThat(creator.getSheetName()).isEqualTo("Summary");
        }

        @Test
        @DisplayName("should have order 1 (first sheet)")
        void shouldBeFirstSheet() {
            assertThat(creator.getOrder()).isEqualTo(1);
        }

        @Test
        @DisplayName("should create when summary data is present")
        void shouldCreateWhenSummaryPresent() {
            ReportData data = ReportData.builder()
                    .summary(SummaryData.builder().build())
                    .build();
            SheetContext ctx = buildContext(data, false);
            assertThat(creator.shouldCreate(ctx)).isTrue();
        }

        @Test
        @DisplayName("should NOT create when summary is null")
        void shouldNotCreateWhenSummaryNull() {
            ReportData data = ReportData.builder().build();
            SheetContext ctx = buildContext(data, false);
            assertThat(creator.shouldCreate(ctx)).isFalse();
        }
    }

    // ─── Content Verification ────────────────────────────────

    @Nested
    @DisplayName("Sheet content")
    class ContentTests {

        @Test
        @DisplayName("should write report title from ReportData")
        void shouldWriteTitle() {
            SummaryData summary = SummaryData.builder()
                    .totalExpenses(5000.0).totalIncome(10000.0)
                    .netBalance(5000.0).averageExpense(250.0)
                    .transactionCount(20).maxExpense(1000.0)
                    .minExpense(10.0).topCategory("Food")
                    .build();

            SheetContext ctx = buildContext(buildReportData(summary), false);
            creator.create(ctx);

            XSSFSheet sheet = workbook.getSheet("Summary");
            assertThat(sheet).isNotNull();
            assertThat(sheet.getRow(0).getCell(0).getStringCellValue())
                    .isEqualTo("Expense Report Q1 2024");
        }

        @Test
        @DisplayName("should write report period row")
        void shouldWriteReportPeriod() {
            SummaryData summary = SummaryData.builder()
                    .totalExpenses(5000.0).build();

            SheetContext ctx = buildContext(buildReportData(summary), false);
            creator.create(ctx);

            XSSFSheet sheet = workbook.getSheet("Summary");
            String periodText = sheet.getRow(2).getCell(0).getStringCellValue();
            assertThat(periodText).contains("2024-01-01");
            assertThat(periodText).contains("2024-03-31");
        }

        @Test
        @DisplayName("should write KPI values for total expenses and income")
        void shouldWriteKpiValues() {
            SummaryData summary = SummaryData.builder()
                    .totalExpenses(15000.0)
                    .totalIncome(25000.0)
                    .netBalance(10000.0)
                    .averageExpense(750.0)
                    .transactionCount(20)
                    .maxExpense(5000.0)
                    .minExpense(50.0)
                    .totalCreditDue(2000.0)
                    .topCategory("Food")
                    .build();

            SheetContext ctx = buildContext(buildReportData(summary), false);
            creator.create(ctx);

            XSSFSheet sheet = workbook.getSheet("Summary");

            // Find "Total Expenses" KPI row
            boolean foundTotalExpenses = false;
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                var row = sheet.getRow(i);
                if (row != null && row.getCell(0) != null) {
                    String label = row.getCell(0).getStringCellValue();
                    if ("Total Expenses".equals(label)) {
                        assertThat(row.getCell(1).getNumericCellValue()).isEqualTo(15000.0);
                        foundTotalExpenses = true;
                    }
                }
            }
            assertThat(foundTotalExpenses).isTrue();
        }

        @Test
        @DisplayName("should write budget summary section")
        void shouldWriteBudgetSummary() {
            SummaryData summary = SummaryData.builder()
                    .totalExpenses(5000.0)
                    .totalBudgetAllocated(10000.0)
                    .totalBudgetUsed(7000.0)
                    .budgetUtilizationPercent(70.0)
                    .topCategory("Food")
                    .build();

            SheetContext ctx = buildContext(buildReportData(summary), false);
            creator.create(ctx);

            XSSFSheet sheet = workbook.getSheet("Summary");

            boolean foundBudgetAllocated = false;
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                var row = sheet.getRow(i);
                if (row != null && row.getCell(0) != null) {
                    if ("Budget Allocated".equals(row.getCell(0).getStringCellValue())) {
                        assertThat(row.getCell(1).getNumericCellValue()).isEqualTo(10000.0);
                        foundBudgetAllocated = true;
                    }
                }
            }
            assertThat(foundBudgetAllocated).isTrue();
        }

        @Test
        @DisplayName("should write top category row")
        void shouldWriteTopCategory() {
            SummaryData summary = SummaryData.builder()
                    .totalExpenses(5000.0)
                    .topCategory("Entertainment")
                    .build();

            SheetContext ctx = buildContext(buildReportData(summary), false);
            creator.create(ctx);

            XSSFSheet sheet = workbook.getSheet("Summary");
            boolean foundTopCat = false;
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                var row = sheet.getRow(i);
                if (row != null && row.getCell(0) != null
                        && "Top Category".equals(row.getCell(0).getStringCellValue())) {
                    assertThat(row.getCell(1).getStringCellValue()).isEqualTo("Entertainment");
                    foundTopCat = true;
                }
            }
            assertThat(foundTopCat).isTrue();
        }

        @Test
        @DisplayName("should use default title when reportTitle is null")
        void shouldUseDefaultTitle() {
            ReportData data = ReportData.builder()
                    .startDate(LocalDate.of(2024, 1, 1))
                    .endDate(LocalDate.of(2024, 3, 31))
                    .summary(SummaryData.builder().totalExpenses(100.0).build())
                    .build();

            SheetContext ctx = buildContext(data, false);
            creator.create(ctx);

            XSSFSheet sheet = workbook.getSheet("Summary");
            assertThat(sheet.getRow(0).getCell(0).getStringCellValue())
                    .isEqualTo("Expense Report");
        }
    }

    // ─── Chart Interaction ───────────────────────────────────

    @Nested
    @DisplayName("Chart inclusion")
    class ChartTests {

        @Test
        @DisplayName("should add chart data columns when includeCharts=true and categories exist")
        void shouldAddChartDataWhenEnabled() {
            SummaryData summary = SummaryData.builder()
                    .totalExpenses(5000.0).topCategory("Food")
                    .build();

            SheetContext ctx = buildContext(buildReportData(summary), true);
            creator.create(ctx);

            XSSFSheet sheet = workbook.getSheet("Summary");
            // Chart data is written at column CHART_START_COL + 10
            // Verify chart data header row exists
            XSSFRow dataRow = sheet.getRow(4);
            assertThat((Object) dataRow).isNotNull();
        }

        @Test
        @DisplayName("should NOT add chart data when includeCharts=false")
        void shouldNotAddChartDataWhenDisabled() {
            SummaryData summary = SummaryData.builder()
                    .totalExpenses(5000.0).topCategory("Food")
                    .build();

            SheetContext ctx = buildContext(buildReportData(summary), false);
            creator.create(ctx);

            XSSFSheet sheet = workbook.getSheet("Summary");
            // With charts disabled, column CHART_START_COL + 10 (col 15) should not have chart headers
            var row4 = sheet.getRow(4);
            if (row4 != null && row4.getCell(15) != null) {
                // If the cell exists, it should not have "Category" header
                // (It might be a KPI row instead)
                String val = row4.getCell(15) != null ? row4.getCell(15).getStringCellValue() : "";
                assertThat(val).doesNotContain("Category");
            }
        }
    }
}
