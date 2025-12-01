package com.jaya.service;

import com.jaya.models.*;
import com.jaya.dto.ExpenseDTO;
import com.jaya.mapper.ExpenseMapper;
import com.jaya.service.excel.ExcelGenerator;
import com.jaya.service.excel.definitions.*;
import com.jaya.service.excel.parser.CategoryExcelParser;
import com.jaya.service.excel.parser.ExpenseExcelParser;
import com.jaya.service.excel.util.ExcelCellWriter;
import com.jaya.service.excel.util.ExcelStyleFactory;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Refactored ExcelService following SOLID and DRY principles
 * - Single Responsibility: Delegates to specialized generators and parsers
 * - Open/Closed: Extensible through ExcelColumnDefinition implementations
 * - Liskov Substitution: Generic ExcelGenerator works with any entity type
 * - Interface Segregation: Separate parsers for different entity types
 * - Dependency Inversion: Depends on abstractions (interfaces) not concrete
 * implementations
 */
@Service
public class ExcelService {

    private final ExpenseService expenseService;
    private final ExpenseExcelParser expenseParser;
    private final CategoryExcelParser categoryParser;
    private final ExpenseMapper expenseMapper;

    @Autowired
    public ExcelService(ExpenseService expenseService,
            ExpenseExcelParser expenseParser,
            CategoryExcelParser categoryParser,
            ExpenseMapper expenseMapper) {
        this.expenseService = expenseService;
        this.expenseParser = expenseParser;
        this.categoryParser = categoryParser;
        this.expenseMapper = expenseMapper;
    }

    /**
     * Generate Excel file for expenses using the modular generator
     */
    public ByteArrayInputStream generateExcel(List<Expense> expenses) throws IOException {
        ExcelGenerator<Expense> generator = new ExcelGenerator<>(new ExpenseColumnDefinition());
        return generator.generate(expenses);
    }

    /**
     * Generate empty Excel template with predefined columns
     */
    public ByteArrayInputStream generateEmptyExcelWithColumns() {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Expenses");
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = ExcelStyleFactory.createHeaderStyle(workbook);

            String[] columns = { "Date", "Type", "Amount", "Description" };
            for (int i = 0; i < columns.length; i++) {
                ExcelCellWriter.createHeaderCell(headerRow, i, columns[i], headerStyle);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate empty Excel file", e);
        }
    }

    /**
     * Generate Excel for expense details
     */
    public ByteArrayInputStream generateExpenseDetailsExcel(List<Expense> expenseDetails) {
        try {
            ExcelGenerator<Expense> generator = new ExcelGenerator<>(new ExpenseDetailsColumnDefinition());
            return generator.generate(expenseDetails);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    /**
     * Generate Excel for monthly summary
     */
    public ByteArrayInputStream generateMonthlySummaryExcel(MonthlySummary summary) {
        try {
            return generateMonthlySummaryWithCategoryBreakdown(summary);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    /**
     * Generate monthly summary with category breakdown section
     */
    private ByteArrayInputStream generateMonthlySummaryWithCategoryBreakdown(MonthlySummary summary)
            throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Monthly Summary");
            CellStyle headerStyle = ExcelStyleFactory.createHeaderStyle(workbook);

            // Summary section
            createSummarySection(sheet, summary, headerStyle);

            // Category breakdown section
            createCategoryBreakdownSection(sheet, summary.getCategoryBreakdown(), 3, headerStyle);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /**
     * Create summary section in sheet
     */
    private void createSummarySection(Sheet sheet, MonthlySummary summary, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(0);
        String[] headers = { "Total Amount", "Balance Remaining", "Current Month Credit Due",
                "Credit Paid", "Credit Due", "Credit Due Message" };

        for (int i = 0; i < headers.length; i++) {
            ExcelCellWriter.createHeaderCell(headerRow, i, headers[i], headerStyle);
        }

        Row summaryRow = sheet.createRow(1);
        ExcelCellWriter.createAndWriteCell(summaryRow, 0,
                summary.getTotalAmount() != null ? summary.getTotalAmount().toString() : "0");
        ExcelCellWriter.createAndWriteCell(summaryRow, 1,
                summary.getBalanceRemaining() != null ? summary.getBalanceRemaining().toString() : "0");
        ExcelCellWriter.createAndWriteCell(summaryRow, 2,
                summary.getCurrentMonthCreditDue() != null ? summary.getCurrentMonthCreditDue().toString() : "0");
        ExcelCellWriter.createAndWriteCell(summaryRow, 3,
                summary.getCreditPaid() != null ? summary.getCreditPaid().toString() : "0");
        ExcelCellWriter.createAndWriteCell(summaryRow, 4,
                summary.getCreditDue() != null ? summary.getCreditDue().toString() : "0");
        ExcelCellWriter.createAndWriteCell(summaryRow, 5, summary.getCreditDueMessage());
    }

    /**
     * Create category breakdown section
     */
    private void createCategoryBreakdownSection(Sheet sheet, Map<String, BigDecimal> breakdown, int startRow,
            CellStyle headerStyle) {
        Row categoryHeaderRow = sheet.createRow(startRow);
        ExcelCellWriter.createHeaderCell(categoryHeaderRow, 0, "Category", headerStyle);
        ExcelCellWriter.createHeaderCell(categoryHeaderRow, 1, "Amount", headerStyle);

        int rowIdx = startRow + 1;
        for (Map.Entry<String, BigDecimal> entry : breakdown.entrySet()) {
            Row row = sheet.createRow(rowIdx++);
            ExcelCellWriter.createAndWriteCell(row, 0, entry.getKey());
            ExcelCellWriter.createAndWriteCell(row, 1, entry.getValue().toString());
        }
    }

    /**
     * Generate Excel for daily summaries
     */
    public ByteArrayInputStream generateDailySummariesExcel(List<DailySummary> summaries) {
        try {
            ExcelGenerator<DailySummary> generator = new ExcelGenerator<>(new DailySummaryColumnDefinition());
            return generator.generate(summaries);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    /**
     * Generate Excel for yearly summaries (reuses DailySummary structure)
     */
    public ByteArrayInputStream generateYearlySummariesExcel(List<DailySummary> summaries) {
        try {
            ExcelGenerator<DailySummary> generator = new ExcelGenerator<>(new DailySummaryColumnDefinition());
            return generator.generate(summaries);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    /**
     * Generate Excel for payment method summary
     */
    public ByteArrayInputStream generatePaymentMethodSummaryExcel(Map<String, Map<String, Double>> summary) {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Payment Method Summary");
            CellStyle headerStyle = ExcelStyleFactory.createHeaderStyle(workbook);

            // Header
            Row headerRow = sheet.createRow(0);
            ExcelCellWriter.createHeaderCell(headerRow, 0, "Payment Method", headerStyle);
            ExcelCellWriter.createHeaderCell(headerRow, 1, "Category", headerStyle);
            ExcelCellWriter.createHeaderCell(headerRow, 2, "Amount", headerStyle);

            // Data
            int rowIdx = 1;
            for (Map.Entry<String, Map<String, Double>> entry : summary.entrySet()) {
                String paymentMethod = entry.getKey();
                for (Map.Entry<String, Double> categoryEntry : entry.getValue().entrySet()) {
                    Row row = sheet.createRow(rowIdx++);
                    ExcelCellWriter.createAndWriteCell(row, 0, paymentMethod);
                    ExcelCellWriter.createAndWriteCell(row, 1, categoryEntry.getKey());
                    ExcelCellWriter.createAndWriteCell(row, 2, categoryEntry.getValue());
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    /**
     * Generate Excel for yearly summary (map-based)
     */
    public ByteArrayInputStream generateYearlySummaryExcel(Map<String, MonthlySummary> summary) {
        try {
            List<Map.Entry<String, MonthlySummary>> entries = new ArrayList<>(summary.entrySet());
            ExcelGenerator<Map.Entry<String, MonthlySummary>> generator = new ExcelGenerator<>(
                    new YearlySummaryColumnDefinition());
            return generator.generate(entries);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    /**
     * Generate Excel for single daily summary
     */
    public ByteArrayInputStream generateDailySummaryExcel(DailySummary summary) {
        try {
            ExcelGenerator<DailySummary> generator = new ExcelGenerator<>(new DailySummaryColumnDefinition());
            return generator.generateSingle(summary);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    /**
     * Generate Excel for monthly summaries list
     */
    public ByteArrayInputStream generateMonthlySummariesExcel(List<MonthlySummary> summaries) {
        try {
            ExcelGenerator<MonthlySummary> generator = new ExcelGenerator<>(new MonthlySummaryColumnDefinition());
            return generator.generate(summaries);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    /**
     * Parse and save expenses from uploaded Excel file
     * Delegates parsing to specialized parser
     */
    public List<Integer> saveAndReturnIds(MultipartFile file, Integer userId) throws Exception {
        List<Expense> expenses = expenseParser.parseExpenses(file);
        List<Integer> addedIds = new ArrayList<>();

        for (Expense expense : expenses) {
            ExpenseDTO savedExpenseDTO = expenseService.addExpense(expenseMapper.toDTO(expense), userId);
            addedIds.add(savedExpenseDTO.getId());
        }

        return addedIds;
    }

    /**
     * Parse expenses from Excel file
     * Delegates to specialized parser
     */
    public List<Expense> parseExcelFile(MultipartFile file) throws IOException {
        return expenseParser.parseExpenses(file);
    }

    /**
     * Parse categories from Excel file
     * Delegates to specialized parser
     */
    public List<Category> parseCategorySummarySheet(MultipartFile file) throws IOException {
        return categoryParser.parseCategories(file);
    }
}