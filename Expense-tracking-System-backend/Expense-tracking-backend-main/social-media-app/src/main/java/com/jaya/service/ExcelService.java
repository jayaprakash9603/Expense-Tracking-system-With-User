package com.jaya.service;

import com.google.j2objc.annotations.AutoreleasePool;
import com.jaya.exceptions.UserException;
import com.jaya.models.*;
import com.jaya.repository.ExpenseRepository;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExcelService {

    public ByteArrayInputStream generateExcel(List<Expense> expenses) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Expenses");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Date", "Expense Name", "Amount", "Type", "Payment Method", "Net Amount", "Comments", "Credit Due"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Data
            int rowIdx = 1;
            for (Expense expense : expenses) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(expense.getId());
                row.createCell(1).setCellValue(expense.getDate().toString());

                ExpenseDetails details = expense.getExpense();
                row.createCell(2).setCellValue(details.getExpenseName());
                row.createCell(3).setCellValue(details.getAmount());
                row.createCell(4).setCellValue(details.getType());
                row.createCell(5).setCellValue(details.getPaymentMethod());
                row.createCell(6).setCellValue(details.getNetAmount());
                row.createCell(7).setCellValue(details.getComments());
                row.createCell(8).setCellValue(details.getCreditDue());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
    
    public ByteArrayInputStream generateEmptyExcelWithColumns() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Expenses");
            Row headerRow = sheet.createRow(0);

            String[] columns = {"Date", "Type", "Amount", "Description"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate empty Excel file", e);
        }
    }
    
    
    public ByteArrayInputStream generateExpenseDetailsExcel(List<Expense> expenseDetails) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Expense Details");
            Row headerRow = sheet.createRow(0);

            String[] columns = {"Expense Name", "Amount", "Type", "Payment Method", "Net Amount", "Comments", "Credit Due"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            int rowIdx = 1;
            for (Expense detail : expenseDetails) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(detail.getExpense().getExpenseName());
                row.createCell(1).setCellValue(detail.getExpense().getAmount());
                row.createCell(2).setCellValue(detail.getExpense().getType());
                row.createCell(3).setCellValue(detail.getExpense().getPaymentMethod());
                row.createCell(4).setCellValue(detail.getExpense().getNetAmount());
                row.createCell(5).setCellValue(detail.getExpense().getComments());
                row.createCell(6).setCellValue(detail.getExpense().getCreditDue());
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    

    public ByteArrayInputStream generateMonthlySummaryExcel(MonthlySummary summary) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Monthly Summary");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Total Amount", "Balance Remaining", "Current Month Credit Due", "Credit Paid", "Credit Due", "Credit Due Message"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Summary Data
            Row summaryRow = sheet.createRow(1);
            summaryRow.createCell(0).setCellValue(summary.getTotalAmount().toString());
            summaryRow.createCell(1).setCellValue(summary.getBalanceRemaining().toString());
            summaryRow.createCell(2).setCellValue(summary.getCurrentMonthCreditDue().toString());
            summaryRow.createCell(3).setCellValue(summary.getCreditPaid().toString());
            summaryRow.createCell(4).setCellValue(summary.getCreditDue().toString());
            summaryRow.createCell(5).setCellValue(summary.getCreditDueMessage());

            // Category Breakdown
            Row categoryHeaderRow = sheet.createRow(3);
            categoryHeaderRow.createCell(0).setCellValue("Category");
            categoryHeaderRow.createCell(1).setCellValue("Amount");

            int rowIdx = 4;
            for (Map.Entry<String, BigDecimal> entry : summary.getCategoryBreakdown().entrySet()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(entry.getKey());
                row.createCell(1).setCellValue(entry.getValue().toString());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    

    public ByteArrayInputStream generateDailySummariesExcel(List<DailySummary> summaries) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Daily Summaries");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Date", "Total Amount", "Balance Remaining", "Current Month Credit Due", "Credit Paid", "Credit Due", "Credit Due Message"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Data
            int rowIdx = 1;
            for (DailySummary summary : summaries) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(summary.getDate().toString());
                row.createCell(1).setCellValue(summary.getTotalAmount().toString());
                row.createCell(2).setCellValue(summary.getBalanceRemaining().toString());
                row.createCell(3).setCellValue(summary.getCurrentMonthCreditDue().toString());
                row.createCell(4).setCellValue(summary.getCreditPaid().toString());
                row.createCell(5).setCellValue(summary.getCreditDue().toString());
                row.createCell(6).setCellValue(summary.getCreditDueMessage());

                // Category Breakdown
                int categoryRowIdx = rowIdx;
                for (Map.Entry<String, BigDecimal> entry : summary.getCategoryBreakdown().entrySet()) {
                    Row categoryRow = sheet.createRow(categoryRowIdx++);
                    categoryRow.createCell(0).setCellValue(entry.getKey());
                    categoryRow.createCell(1).setCellValue(entry.getValue().toString());
                }
                rowIdx = categoryRowIdx;
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    

    public ByteArrayInputStream generateYearlySummariesExcel(List<DailySummary> summaries) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Yearly Summaries");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Date", "Total Amount", "Balance Remaining", "Current Month Credit Due", "Credit Paid", "Credit Due", "Credit Due Message"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Data
            int rowIdx = 1;
            for (DailySummary summary : summaries) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(summary.getDate().toString());
                row.createCell(1).setCellValue(summary.getTotalAmount().toString());
                row.createCell(2).setCellValue(summary.getBalanceRemaining().toString());
                row.createCell(3).setCellValue(summary.getCurrentMonthCreditDue().toString());
                row.createCell(4).setCellValue(summary.getCreditPaid().toString());
                row.createCell(5).setCellValue(summary.getCreditDue().toString());
                row.createCell(6).setCellValue(summary.getCreditDueMessage());

                // Category Breakdown
                int categoryRowIdx = rowIdx;
                for (Map.Entry<String, BigDecimal> entry : summary.getCategoryBreakdown().entrySet()) {
                    Row categoryRow = sheet.createRow(categoryRowIdx++);
                    categoryRow.createCell(0).setCellValue(entry.getKey());
                    categoryRow.createCell(1).setCellValue(entry.getValue().toString());
                }
                rowIdx = categoryRowIdx;
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    
    public ByteArrayInputStream generatePaymentMethodSummaryExcel(Map<String, Map<String, Double>> summary) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Payment Method Summary");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Payment Method", "Category", "Amount"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Data
            int rowIdx = 1;
            for (Map.Entry<String, Map<String, Double>> entry : summary.entrySet()) {
                String paymentMethod = entry.getKey();
                for (Map.Entry<String, Double> categoryEntry : entry.getValue().entrySet()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(paymentMethod);
                    row.createCell(1).setCellValue(categoryEntry.getKey());
                    row.createCell(2).setCellValue(categoryEntry.getValue());
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    
    

    public ByteArrayInputStream generateYearlySummaryExcel(Map<String, MonthlySummary> summary) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Yearly Summary");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Month", "Total Amount", "Balance Remaining", "Current Month Credit Due", "Credit Paid", "Credit Due", "Credit Due Message"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Data
            int rowIdx = 1;
            for (Map.Entry<String, MonthlySummary> entry : summary.entrySet()) {
                MonthlySummary monthlySummary = entry.getValue();
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(entry.getKey());
                row.createCell(1).setCellValue(monthlySummary.getTotalAmount().toString());
                row.createCell(2).setCellValue(monthlySummary.getBalanceRemaining().toString());
                row.createCell(3).setCellValue(monthlySummary.getCurrentMonthCreditDue().toString());
                row.createCell(4).setCellValue(monthlySummary.getCreditPaid().toString());
                row.createCell(5).setCellValue(monthlySummary.getCreditDue().toString());
                row.createCell(6).setCellValue(monthlySummary.getCreditDueMessage());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    
    public ByteArrayInputStream generateDailySummaryExcel(DailySummary summary) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Daily Summary");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Date", "Total Amount", "Balance Remaining", "Current Month Credit Due", "Credit Paid", "Credit Due", "Credit Due Message"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Data
            Row row = sheet.createRow(1);
            row.createCell(0).setCellValue(summary.getDate().toString());
            row.createCell(1).setCellValue(summary.getTotalAmount().toString());
            row.createCell(2).setCellValue(summary.getBalanceRemaining().toString());
            row.createCell(3).setCellValue(summary.getCurrentMonthCreditDue().toString());
            row.createCell(4).setCellValue(summary.getCreditPaid().toString());
            row.createCell(5).setCellValue(summary.getCreditDue().toString());
            row.createCell(6).setCellValue(summary.getCreditDueMessage());

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    
    public ByteArrayInputStream generateMonthlySummariesExcel(List<MonthlySummary> summaries) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Monthly Summaries");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Month", "Total Amount", "Balance Remaining", "Current Month Credit Due", "Credit Paid", "Credit Due", "Credit Due Message"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Data
            int rowIdx = 1;
            for (MonthlySummary summary : summaries) {
                Row row = sheet.createRow(rowIdx++);
//                row.createCell(0).setCellValue(summary.getMonth());
                row.createCell(1).setCellValue(summary.getTotalAmount().toString());
                row.createCell(2).setCellValue(summary.getBalanceRemaining().toString());
                row.createCell(3).setCellValue(summary.getCurrentMonthCreditDue().toString());
                row.createCell(4).setCellValue(summary.getCreditPaid().toString());
                row.createCell(5).setCellValue(summary.getCreditDue().toString());
                row.createCell(6).setCellValue(summary.getCreditDueMessage());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    


    public ByteArrayInputStream generateAuditLogsExcel(List<AuditExpense> logs) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Audit Logs");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Expense ID", "Action Type", "Details", "Timestamp"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Data
            int rowIdx = 1;
            for (AuditExpense log : logs) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(log.getId());
                row.createCell(1).setCellValue(log.getExpenseId() != null ? log.getExpenseId() : 0); // Handle null expenseId
                row.createCell(2).setCellValue(log.getActionType());
                row.createCell(3).setCellValue(log.getDetails());
                row.createCell(4).setCellValue(log.getTimestamp().toString());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    
   

    @Autowired
    private ExpenseRepository expenseRepository;


    @Autowired
    private ExpenseService expenseService;
    @Autowired
    private AuditExpenseService auditExpenseService;
    public List<Integer> saveAndReturnIds(MultipartFile file, User user) throws Exception {
        List<Expense> expenses = parseExcelFile(file);
        List<Integer> addedIds = new ArrayList<>();
        for (Expense expense : expenses) {
            Expense savedExpense = expenseService.addExpense(expense,user);
            addedIds.add(savedExpense.getId());
            auditExpenseService.logAudit(user,savedExpense.getId(), "create", "Expense created with ID: " + savedExpense.getId());
        }
        return addedIds;
    }

    public List<Expense> parseExcelFile(MultipartFile file) throws IOException {
        List<Expense> expenses = new ArrayList<>();
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Read the header row to determine column indices
        Map<String, Integer> columnIndices = new HashMap<>();
        Row headerRow = sheet.getRow(0);
        for (Cell cell : headerRow) {
            columnIndices.put(cell.getStringCellValue(), cell.getColumnIndex());
        }

        for (Row row : sheet) {
            if (row.getRowNum() == 0) {
                continue; // Skip header row
            }

            Expense expense = new Expense();
            ExpenseDetails expenseDetails = new ExpenseDetails();

            String dateStr = getCellValue(row.getCell(columnIndices.get("Date")));
            if (!dateStr.isEmpty()) {
                try {
                    expense.setDate(LocalDate.parse(dateStr, formatter));
                } catch (DateTimeParseException e) {
                    // Handle invalid date format
                    continue; // Skip this row if date is invalid
                }
            } else {
                continue; // Skip this row if date is empty
            }

            expenseDetails.setExpenseName(getCellValue(row.getCell(columnIndices.get("Expense Name"))));
            expenseDetails.setAmount(Double.parseDouble(getCellValue(row.getCell(columnIndices.get("Amount")))));
            expenseDetails.setType(getCellValue(row.getCell(columnIndices.get("Type"))));
            expenseDetails.setPaymentMethod(getCellValue(row.getCell(columnIndices.get("Payment Method"))));
            expenseDetails.setNetAmount(Double.parseDouble(getCellValue(row.getCell(columnIndices.get("Net Amount")))));
            expenseDetails.setComments(getCellValue(row.getCell(columnIndices.get("Comments"))));
            expenseDetails.setCreditDue(Double.parseDouble(getCellValue(row.getCell(columnIndices.get("Credit Due")))));

            expense.setExpense(expenseDetails);
            expenseDetails.setExpense(expense);

            expenses.add(expense);
        }

        workbook.close();
        return expenses;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) {
            return "";
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return "";
            default:
                return "";
        }
    }
}