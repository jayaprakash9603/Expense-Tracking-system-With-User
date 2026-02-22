package com.jaya.service.expenses.impl;

import com.jaya.common.dto.UserDTO;
import com.jaya.models.*;
import com.jaya.repository.ExpenseReportRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.BudgetServices;
import com.jaya.service.CategoryServiceWrapper;
import com.jaya.service.expenses.ExpenseReportService;
import com.jaya.util.ExpenseValidationHelper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ExpenseReportServiceImpl implements ExpenseReportService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseReportRepository expenseReportRepository;

    @Autowired
    private ExpenseValidationHelper helper;

    @Autowired
    private CategoryServiceWrapper categoryService;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private BudgetServices budgetService;

    public ExpenseReportServiceImpl(ExpenseRepository expenseRepository,
            ExpenseReportRepository expenseReportRepository) {
        this.expenseRepository = expenseRepository;
        this.expenseReportRepository = expenseReportRepository;
    }

    @Override
    public ExpenseReport generateExpenseReport(Integer expenseId, Integer userId) {

        Expense expenseOptional = expenseRepository.findByUserIdAndId(userId, expenseId);

        if (expenseOptional != null) {
            Expense expense = expenseOptional;
            String expenseName = expense.getExpense().getExpenseName();
            String comments = expense.getExpense().getComments();

            ExpenseReport report = new ExpenseReport();
            report.setExpenseId(expense.getId());
            report.setExpenseName(expenseName);
            report.setComments(comments);
            report.setGeneratedDate(LocalDate.now());
            report.setTotalAmount(expense.getExpense().getAmount());
            report.setReportDetails("Generated report for expense ID " + expense.getId());

            LocalDateTime indiaTime = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
            String formattedTime = indiaTime.format(formatter);
            report.setGeneratedTime(formattedTime);

            return expenseReportRepository.save(report);
        } else {
            
            throw new RuntimeException("Expense not found for ID: " + expenseId);
        }
    }

    @Override
    public String generateExcelReport(Integer userId) throws Exception {
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        UserDTO UserDTO = helper.validateUser(userId);
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet expensesSheet = workbook.createSheet("Expenses");
            Map<Integer, ExpenseCategory> categoryCache = preloadCategories(userId);
            writeExpensesHeader(expensesSheet);
            writeExpensesRows(expensesSheet, expenses);
            autosizeColumns(expensesSheet, 14);

            Sheet summarySheet = workbook.createSheet("ExpenseCategory Summary");
            writeCategorySummaryHeader(summarySheet);
            Map<Integer, Double> categoryTotals = computeCategoryTotals(expenses);
            Map<Integer, Integer> categoryCounts = computeCategoryCounts(expenses);
            writeCategorySummaryRows(summarySheet, categoryTotals, categoryCounts, categoryCache);
            autosizeColumns(summarySheet, 10);

            Sheet paymentMethodSheet = workbook.createSheet("Payment Method Summary");
            writePaymentMethodHeader(paymentMethodSheet);
            Map<String, Double> pmTotals = computePaymentMethodTotals(expenses);
            Map<String, Integer> pmCounts = computePaymentMethodCounts(expenses);
            writePaymentMethodRows(paymentMethodSheet, pmTotals, pmCounts);
            autosizeColumns(paymentMethodSheet, 3);

            Sheet budgetSheet = workbook.createSheet("Budgets");
            writeBudgetHeader(budgetSheet);
            List<BudgetModel> budgets = budgetService.getAllBudgetForUser(userId);
            writeBudgetRows(budgetSheet, budgets);
            autosizeColumns(budgetSheet, 9);

            String filePath = buildReportPath(UserDTO, userId);
            writeWorkbookToFile(workbook, filePath);
            return filePath;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    
    private void writeExpensesHeader(Sheet sheet) {
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Expense ID");
        headerRow.createCell(1).setCellValue("Expense Name");
        headerRow.createCell(2).setCellValue("Payment Method");
        headerRow.createCell(3).setCellValue("Amount");
        headerRow.createCell(4).setCellValue("Net Amount");
        headerRow.createCell(5).setCellValue("Credit Due");
        headerRow.createCell(6).setCellValue("Type");
        headerRow.createCell(7).setCellValue("Date");
        headerRow.createCell(8).setCellValue("ExpenseCategory ID");
        headerRow.createCell(9).setCellValue("ExpenseCategory Name");
        headerRow.createCell(10).setCellValue("Comments");
    }

    private void writeExpensesRows(Sheet sheet, List<Expense> expenses) {
        int rowNum = 1;
        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null)
                continue;
            if (expense.isBill())
                continue;
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(expense.getId() != null ? expense.getId() : 0);
            row.createCell(1).setCellValue(details.getExpenseName());
            row.createCell(2).setCellValue(details.getPaymentMethod());
            row.createCell(3).setCellValue(details.getAmount());
            row.createCell(4).setCellValue(details.getNetAmount());
            row.createCell(5).setCellValue(details.getCreditDue());
            row.createCell(6).setCellValue(details.getType());
            row.createCell(7).setCellValue(expense.getDate() != null ? expense.getDate().toString() : "");
            row.createCell(8).setCellValue(expense.getCategoryId() != null ? expense.getCategoryId() : 0);
            row.createCell(9).setCellValue(expense.getCategoryName() != null ? expense.getCategoryName() : "Others");
            row.createCell(10).setCellValue(details.getComments() != null ? details.getComments() : "");
        }
    }

    
    private void writeCategorySummaryHeader(Sheet summarySheet) {
        Row summaryHeader = summarySheet.createRow(0);
        summaryHeader.createCell(0).setCellValue("ExpenseCategory ID");
        summaryHeader.createCell(1).setCellValue("ExpenseCategory Name");
        summaryHeader.createCell(2).setCellValue("ExpenseCategory Color");
        summaryHeader.createCell(3).setCellValue("ExpenseCategory Icon");
        summaryHeader.createCell(4).setCellValue("ExpenseCategory Description");
        summaryHeader.createCell(5).setCellValue("Is Global");
        summaryHeader.createCell(6).setCellValue("Total Amount");
        summaryHeader.createCell(7).setCellValue("Number of Expenses");
        summaryHeader.createCell(8).setCellValue("UserDTO Ids");
        summaryHeader.createCell(9).setCellValue("Edited UserIds");
    }

    private Map<Integer, Double> computeCategoryTotals(List<Expense> expenses) {
        Map<Integer, Double> totals = new HashMap<>();
        for (Expense expense : expenses) {
            Integer categoryId = expense.getCategoryId();
            if (categoryId == null)
                categoryId = 0;
            double amount = expense.getExpense() != null ? expense.getExpense().getAmount() : 0;
            totals.put(categoryId, totals.getOrDefault(categoryId, 0.0) + amount);
        }
        return totals;
    }

    private Map<Integer, Integer> computeCategoryCounts(List<Expense> expenses) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (Expense expense : expenses) {
            Integer categoryId = expense.getCategoryId();
            if (categoryId == null)
                categoryId = 0;
            counts.put(categoryId, counts.getOrDefault(categoryId, 0) + 1);
        }
        return counts;
    }

    private void writeCategorySummaryRows(Sheet sheet, Map<Integer, Double> totals, Map<Integer, Integer> counts,
            Map<Integer, ExpenseCategory> cache) {
        int rowNum = 1;
        for (Map.Entry<Integer, Double> entry : totals.entrySet()) {
            Integer categoryId = entry.getKey();
            Double totalAmount = entry.getValue();
            Integer expenseCount = counts.get(categoryId);

            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(categoryId);

            String categoryName = "Uncategorized";
            String categoryColor = "";
            String categoryIcon = "";
            String categoryDescription = "";
            boolean isGlobal = false;
            Set<Integer> editedUserIds = new HashSet<>();
            Set<Integer> userIds = new HashSet<>();
            if (categoryId != null && categoryId > 0) {
                ExpenseCategory category = cache.get(categoryId);
                if (category != null) {
                    categoryName = category.getName();
                    categoryColor = category.getColor();
                    categoryIcon = category.getIcon();
                    categoryDescription = category.getDescription();
                    isGlobal = category.isGlobal();
                    userIds = category.getUserIds();
                    editedUserIds = category.getEditUserIds();
                }
            }

            row.createCell(1).setCellValue(categoryName);
            row.createCell(2).setCellValue(categoryColor);
            row.createCell(3).setCellValue(categoryIcon);
            row.createCell(4).setCellValue(categoryDescription);
            row.createCell(5).setCellValue(isGlobal);
            row.createCell(6).setCellValue(totalAmount);
            row.createCell(7).setCellValue(expenseCount != null ? expenseCount : 0);
            row.createCell(8).setCellValue(userIds != null ? userIds.toString() : "[]");
            row.createCell(9).setCellValue(editedUserIds != null ? editedUserIds.toString() : "[]");
        }
    }

    
    private void writePaymentMethodHeader(Sheet sheet) {
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Payment Method");
        header.createCell(1).setCellValue("Total Amount");
        header.createCell(2).setCellValue("Number of Expenses");
    }

    private Map<String, Double> computePaymentMethodTotals(List<Expense> expenses) {
        Map<String, Double> totals = new HashMap<>();
        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null)
                continue;
            String method = details.getPaymentMethod();
            if (method == null || method.isEmpty())
                continue;
            double amount = details.getAmount();
            totals.put(method, totals.getOrDefault(method, 0.0) + amount);
        }
        return totals;
    }

    private Map<String, Integer> computePaymentMethodCounts(List<Expense> expenses) {
        Map<String, Integer> counts = new HashMap<>();
        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null)
                continue;
            String method = details.getPaymentMethod();
            if (method == null || method.isEmpty())
                continue;
            counts.put(method, counts.getOrDefault(method, 0) + 1);
        }
        return counts;
    }

    private void writePaymentMethodRows(Sheet sheet, Map<String, Double> totals, Map<String, Integer> counts) {
        int rowNum = 1;
        for (Map.Entry<String, Double> entry : totals.entrySet()) {
            String method = entry.getKey();
            Double totalAmount = entry.getValue();
            Integer count = counts.get(method);
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(method);
            row.createCell(1).setCellValue(totalAmount);
            row.createCell(2).setCellValue(count != null ? count : 0);
        }
    }

    
    private void writeBudgetHeader(Sheet sheet) {
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("BudgetModel ID");
        header.createCell(1).setCellValue("Name");
        header.createCell(2).setCellValue("Description");
        header.createCell(3).setCellValue("Amount");
        header.createCell(4).setCellValue("Remaining Amount");
        header.createCell(5).setCellValue("Start Date");
        header.createCell(6).setCellValue("End Date");
        header.createCell(7).setCellValue("Has Expenses");
        header.createCell(8).setCellValue("Expenses Ids");
    }

    private void writeBudgetRows(Sheet sheet, List<BudgetModel> budgets) {
        int rowNum = 1;
        for (BudgetModel BudgetModel : budgets) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(BudgetModel.getId());
            row.createCell(1).setCellValue(BudgetModel.getName());
            row.createCell(2).setCellValue(BudgetModel.getDescription());
            row.createCell(3).setCellValue(BudgetModel.getAmount());
            row.createCell(4).setCellValue(BudgetModel.getRemainingAmount());
            row.createCell(5).setCellValue(BudgetModel.getStartDate() != null ? BudgetModel.getStartDate().toString() : "");
            row.createCell(6).setCellValue(BudgetModel.getEndDate() != null ? BudgetModel.getEndDate().toString() : "");
            row.createCell(7).setCellValue(BudgetModel.isBudgetHasExpenses());
            row.createCell(8).setCellValue(BudgetModel.getExpenseIds() != null ? BudgetModel.getExpenseIds().toString() : "");
        }
    }

    
    private Map<Integer, ExpenseCategory> preloadCategories(Integer userId) throws Exception {
        Map<Integer, ExpenseCategory> cache = new HashMap<>();
        List<ExpenseCategory> categories = categoryService.getAllForUser(userId);
        if (categories != null) {
            for (ExpenseCategory c : categories) {
                if (c != null && c.getId() != null) {
                    cache.put(c.getId(), c);
                }
            }
        }
        return cache;
    }

    private void autosizeColumns(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String buildReportPath(UserDTO UserDTO, Integer userId) {
        String emailPrefix = UserDTO.getEmail().split("@")[0];
        String userFolderName = emailPrefix + "_" + userId;
        String userFolderPath = Paths.get(System.getProperty("UserDTO.home"), "reports", userFolderName).toString();
        File userFolder = new File(userFolderPath);
        if (!userFolder.exists()) {
            userFolder.mkdirs();
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss");
        String timestamp = dateFormat.format(new Date());
        return Paths.get(userFolderPath, "expenses_report_" + timestamp + ".xlsx").toString();
    }

    private void writeWorkbookToFile(Workbook workbook, String filePath) throws IOException {
        try (FileOutputStream fileOut = new FileOutputStream(filePath)) {
            workbook.write(fileOut);
        }
    }

    @Override
    public ResponseEntity<String> generateAndSendMonthlyReport(ReportRequest request) {
        try {

            String reportsDir = System.getProperty("UserDTO.home") + "/reports";
            Files.createDirectories(Paths.get(reportsDir));

            String uniqueFileName = "monthly_report_" + UUID.randomUUID() + ".xlsx";
            Path reportPath = Paths.get(reportsDir, uniqueFileName);

            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Monthly Report");

            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Date");
            headerRow.createCell(1).setCellValue("Description");
            headerRow.createCell(2).setCellValue("Amount");

            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("2024-11-01");
            dataRow.createCell(1).setCellValue("Office Supplies");
            dataRow.createCell(2).setCellValue(150.00);

            try (FileOutputStream fileOut = new FileOutputStream(reportPath.toFile())) {
                workbook.write(fileOut);
            }
            workbook.close();

            sendEmailWithAttachment(request.getToEmail(), "Monthly Expense Report",
                    "Please find the attached monthly expense report.", reportPath.toString());

            return ResponseEntity.ok("Monthly report sent to " + request.getToEmail());
        } catch (IOException | MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate and send the report");
        }
    }

    @Override
    public void sendEmailWithAttachment(String toEmail, String subject, String body, String attachmentPath)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(body);
        helper.addAttachment("expenses_report.xlsx", new File(attachmentPath));

        mailSender.send(message);
    }
}

