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
    


//    public ByteArrayInputStream generateAuditLogsExcel(List<AuditExpense> logs) {
//        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
//            Sheet sheet = workbook.createSheet("Audit Logs");
//
//            // Header
//            Row headerRow = sheet.createRow(0);
//            String[] headers = {"ID", "Expense ID", "Action Type", "Details", "Timestamp"};
//            for (int i = 0; i < headers.length; i++) {
//                Cell cell = headerRow.createCell(i);
//                cell.setCellValue(headers[i]);
//            }
//
//            // Data
//            int rowIdx = 1;
//            for (AuditExpense log : logs) {
//                Row row = sheet.createRow(rowIdx++);
//                row.createCell(0).setCellValue(log.getId());
//                row.createCell(1).setCellValue(log.getExpenseId() != null ? log.getExpenseId() : 0); // Handle null expenseId
//                row.createCell(2).setCellValue(log.getActionType());
//                row.createCell(3).setCellValue(log.getDetails());
//                row.createCell(4).setCellValue(log.getTimestamp().toString());
//            }
//
//            workbook.write(out);
//            return new ByteArrayInputStream(out.toByteArray());
//        } catch (IOException e) {
//            throw new RuntimeException("Failed to generate Excel file", e);
//        }
//    }
    
   

    @Autowired
    private ExpenseRepository expenseRepository;


    @Autowired
    private ExpenseService expenseService;
//    @Autowired
//    private AuditExpenseService auditExpenseService;
    public List<Integer> saveAndReturnIds(MultipartFile file, Integer userId) throws Exception {
        List<Expense> expenses = parseExcelFile(file);
        List<Integer> addedIds = new ArrayList<>();
        for (Expense expense : expenses) {
            Expense savedExpense = expenseService.addExpense(expense,userId);
            addedIds.add(savedExpense.getId());
            // auditExpenseService.logAudit(user,savedExpense.getId(), "create", "Expense created with ID: " + savedExpense.getId());
        }
        return addedIds;
    }

    public List<Expense> parseExcelFile(MultipartFile file) throws IOException {
        List<Expense> expenses = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

            // Read the header row to determine column indices (normalized, case/space-insensitive)
            Map<String, Integer> columnIndices = new HashMap<>();
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                return expenses; // no rows
            }
            for (Cell cell : headerRow) {
                String header = getCellValue(cell, evaluator).trim();
                if (!header.isEmpty()) {
                    columnIndices.put(normalizeHeader(header), cell.getColumnIndex());
                }
            }

            // Helper to find a column index by synonyms
            java.util.function.Function<String[], Integer> findCol = (syns) -> {
                for (String s : syns) {
                    Integer idx = columnIndices.get(normalizeHeader(s));
                    if (idx != null) return idx;
                }
                return null;
            };

            Integer dateCol = findCol.apply(new String[]{"Date", "Transaction Date", "Day"});
            Integer nameCol = findCol.apply(new String[]{"Expense Name", "Description", "Name", "Expense"});
            Integer amountCol = findCol.apply(new String[]{"Amount", "Amt", "Value", "Price"});
            Integer typeCol = findCol.apply(new String[]{"Type"});
            Integer paymentMethodCol = findCol.apply(new String[]{"Payment Method", "Payment", "Method"});
            Integer netAmountCol = findCol.apply(new String[]{"Net Amount", "Net"});
            Integer commentsCol = findCol.apply(new String[]{"Comments", "Comment", "Notes", "Remark"});
            Integer creditDueCol = findCol.apply(new String[]{"Credit Due", "Credit_Due", "CreditDue", "Credit"});
            Integer categoryIdCol = findCol.apply(new String[]{"Category ID", "Category_Id", "CategoryId"});
            Integer categoryNameCol = findCol.apply(new String[]{"Category Name", "Category", "CategoryName"});

            for (Row row : sheet) {
                if (row.getRowNum() == 0) {
                    continue; // Skip header row
                }

                Expense expense = new Expense();
                ExpenseDetails expenseDetails = new ExpenseDetails();

                // Date (required)
                String dateStr = dateCol != null ? getCellValue(row.getCell(dateCol), evaluator) : "";
                if (!dateStr.isEmpty()) {
                    try {
                        expense.setDate(LocalDate.parse(dateStr, formatter));
                    } catch (DateTimeParseException e) {
                        // If Excel date was numeric and formatted differently, try from cell directly
                        Cell dc = dateCol != null ? row.getCell(dateCol) : null;
                        if (dc != null && dc.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(dc)) {
                            expense.setDate(dc.getLocalDateTimeCellValue().toLocalDate());
                        } else {
                            continue; // Skip this row if date is invalid
                        }
                    }
                } else {
                    // Try Excel date numeric
                    Cell dc = dateCol != null ? row.getCell(dateCol) : null;
                    if (dc != null && dc.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(dc)) {
                        expense.setDate(dc.getLocalDateTimeCellValue().toLocalDate());
                    } else {
                        continue; // Skip this row if date is empty
                    }
                }

                // Expense Name (fallback to Description)
                String expName = nameCol != null ? getCellValue(row.getCell(nameCol), evaluator) : "";
                expenseDetails.setExpenseName(expName);

                // Amount (required)
                String amountStr = amountCol != null ? getCellValue(row.getCell(amountCol), evaluator) : "";
                Double amount = parseDoubleSafe(amountStr, null);
                if (amount == null) {
                    continue; // amount missing -> skip row
                }
                expenseDetails.setAmount(amount);

                // Type (optional)
                String type = typeCol != null ? getCellValue(row.getCell(typeCol), evaluator) : "";
                expenseDetails.setType(type);

                // Payment Method (optional)
                String pMethod = paymentMethodCol != null ? getCellValue(row.getCell(paymentMethodCol), evaluator) : "";
                expenseDetails.setPaymentMethod(pMethod);

                // Net Amount (optional, fallback to Amount)
                String netAmountStr = netAmountCol != null ? getCellValue(row.getCell(netAmountCol), evaluator) : "";
                Double netAmount = parseDoubleSafe(netAmountStr, amount);
                expenseDetails.setNetAmount(netAmount);

                // Comments (optional)
                String comments = commentsCol != null ? getCellValue(row.getCell(commentsCol), evaluator) : "";
                expenseDetails.setComments(comments);

                // Credit Due (optional, default 0.0)
                String creditDueStr = creditDueCol != null ? getCellValue(row.getCell(creditDueCol), evaluator) : "";
                Double creditDue = parseDoubleSafe(creditDueStr, 0.0);
                expenseDetails.setCreditDue(creditDue);

                // Category fields (optional)
                String categoryIdStr = categoryIdCol != null ? getCellValue(row.getCell(categoryIdCol), evaluator) : "";
                Integer categoryId = parseIntegerSafe(categoryIdStr, null);
                expense.setCategoryId(categoryId);
                String categoryName = categoryNameCol != null ? getCellValue(row.getCell(categoryNameCol), evaluator) : "";
                expense.setCategoryName(categoryName);

                expense.setExpense(expenseDetails);
                expenseDetails.setExpense(expense);

                expenses.add(expense);
            }

            return expenses;
        }
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

    // Overload that evaluates formulas and normalizes output to String
    private String getCellValue(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null) return "";
        CellType type = cell.getCellType();
        if (type == CellType.FORMULA && evaluator != null) {
            type = evaluator.evaluateFormulaCell(cell);
        }
        switch (type) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    // Avoid scientific notation surprises
                    double val = cell.getNumericCellValue();
                    // trim trailing .0
                    String s = Double.toString(val);
                    if (s.endsWith(".0")) s = s.substring(0, s.length() - 2);
                    return s;
                }
            case BOOLEAN:
                return Boolean.toString(cell.getBooleanCellValue());
            case BLANK:
                return "";
            case ERROR:
                return "";
            default:
                return cell.toString();
        }
    }

    private static String normalizeHeader(String header) {
        return header == null ? "" : header.trim().toLowerCase().replaceAll("[ _-]", "");
    }

    private static Double parseDoubleSafe(String s, Double defaultVal) {
        if (s == null) return defaultVal;
        String t = s.trim();
        if (t.isEmpty()) return defaultVal;
        // remove common formatting
        t = t.replace(",", "");
        try {
            return Double.parseDouble(t);
        } catch (NumberFormatException ex) {
            return defaultVal;
        }
    }

    private static Integer parseIntegerSafe(String s, Integer defaultVal) {
        if (s == null) return defaultVal;
        String t = s.trim();
        if (t.isEmpty()) return defaultVal;
        t = t.replace(",", "");
        try {
            return Integer.parseInt(t);
        } catch (NumberFormatException ex) {
            try {
                // In case the cell had a double like "12.0"
                Double d = Double.parseDouble(t);
                return d.intValue();
            } catch (NumberFormatException ex2) {
                return defaultVal;
            }
        }
    }
}