package com.jaya.service.expenses.impl;

import com.jaya.dto.User;
import com.jaya.models.*;
import com.jaya.repository.ExpenseReportRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.BudgetServices;
import com.jaya.service.CategoryServices;
import com.jaya.service.expenses.ExpenseReportService;
import com.jaya.util.ServiceHelper;
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
import java.io.FileNotFoundException;
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
    private ServiceHelper helper;


    @Autowired
    private CategoryServices categoryService;


    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private BudgetServices budgetService;

    public ExpenseReportServiceImpl(ExpenseRepository expenseRepository, ExpenseReportRepository expenseReportRepository) {
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
            // If the expense does not exist, throw an exception
            throw new RuntimeException("Expense not found for ID: " + expenseId);
        }
    }

    @Override
    public String generateExcelReport(Integer userId) throws Exception {
        List<Expense> expenses = expenseRepository.findByUserId(userId);

        User user = helper.validateUser(userId);
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Expenses");

        // Create header row with additional category columns
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Expense Name");
        headerRow.createCell(1).setCellValue("Payment Method");
        headerRow.createCell(2).setCellValue("Amount");
        headerRow.createCell(3).setCellValue("Net Amount");
        headerRow.createCell(4).setCellValue("Credit Due");
        headerRow.createCell(5).setCellValue("Type");
        headerRow.createCell(6).setCellValue("Date");
        headerRow.createCell(7).setCellValue("Category ID");
        headerRow.createCell(8).setCellValue("Comments");

        // Create a map to cache category information to avoid repeated database lookups
        Map<Integer, Category> categoryCache = new HashMap<>();

        int rowNum = 1;
        for (Expense expense : expenses) {
            ExpenseDetails details = expense.getExpense();
            if (details == null) continue;

            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(expense.getId());
            row.createCell(1).setCellValue(details.getExpenseName());
            row.createCell(2).setCellValue(details.getPaymentMethod());
            row.createCell(3).setCellValue(details.getAmount());
            row.createCell(4).setCellValue(details.getNetAmount());
            row.createCell(5).setCellValue(details.getCreditDue());
            row.createCell(6).setCellValue(details.getType());
            row.createCell(7).setCellValue(expense.getDate().toString());
            row.createCell(8).setCellValue(expense.getCategoryId() != null ? expense.getCategoryId() : 0);
            row.createCell(9).setCellValue(details.getComments() != null ? details.getComments() : "");
        }


        // Auto-size columns for better readability
        for (int i = 0; i < 14; i++) {
            sheet.autoSizeColumn(i);
        }

        // Create a summary sheet
        Sheet summarySheet = workbook.createSheet("Category Summary");
        Row summaryHeader = summarySheet.createRow(0);
        summaryHeader.createCell(0).setCellValue("Category ID");
        summaryHeader.createCell(1).setCellValue("Category Name");
        summaryHeader.createCell(2).setCellValue("Category Color");
        summaryHeader.createCell(3).setCellValue("Category Icon");
        summaryHeader.createCell(4).setCellValue("Category Description");
        summaryHeader.createCell(5).setCellValue("Is Global");
        summaryHeader.createCell(6).setCellValue("Total Amount");
        summaryHeader.createCell(7).setCellValue("Number of Expenses");
        summaryHeader.createCell(8).setCellValue("User Ids");
        summaryHeader.createCell(9).setCellValue("Edited UserIds");

        // Calculate totals by category
        Map<Integer, Double> categoryTotals = new HashMap<>();
        Map<Integer, Integer> categoryExpenseCounts = new HashMap<>();

        for (Expense expense : expenses) {
            Integer categoryId = expense.getCategoryId();
            if (categoryId == null) categoryId = 0;

            double amount = expense.getExpense() != null ? expense.getExpense().getAmount() : 0;
            categoryTotals.put(categoryId, categoryTotals.getOrDefault(categoryId, 0.0) + amount);
            categoryExpenseCounts.put(categoryId, categoryExpenseCounts.getOrDefault(categoryId, 0) + 1);
        }

        // Write summary data
        int summaryRowNum = 1;

        List<Category> categories = categoryService.getAllForUser(userId);
        for (Map.Entry<Integer, Double> entry : categoryTotals.entrySet()) {
            Integer categoryId = entry.getKey();
            Double totalAmount = entry.getValue();
            Integer expenseCount = categoryExpenseCounts.get(categoryId);

            Row row = summarySheet.createRow(summaryRowNum++);
            row.createCell(0).setCellValue(categoryId);

            // Get category details
            String categoryName = "Uncategorized";
            String categoryColor = "";
            String categoryIcon = "";
            String categoryDescription = "";
            Set<Integer> expenseIds = new HashSet<>();
            boolean isGlobal = false;
            Set<Integer> editedUserIds = new HashSet<>();
            Set<Integer> userIds = new HashSet<>();
            if (categoryId > 0) {
                Category category = categoryCache.get(categoryId);
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
            row.createCell(7).setCellValue(expenseCount);
            row.createCell(8).setCellValue(userIds != null ? userIds.toString() : "[]");
            row.createCell(9).setCellValue(editedUserIds != null ? editedUserIds.toString() : "[]");
        }

        // Auto-size summary columns
        for (int i = 0; i < 10; i++) {
            summarySheet.autoSizeColumn(i);
        }

        // Create a payment method summary sheet
        Sheet paymentMethodSheet = workbook.createSheet("Payment Method Summary");
        Row paymentMethodHeader = paymentMethodSheet.createRow(0);
        paymentMethodHeader.createCell(0).setCellValue("Payment Method");
        paymentMethodHeader.createCell(1).setCellValue("Total Amount");
        paymentMethodHeader.createCell(2).setCellValue("Number of Expenses");

        // Calculate totals by payment method
        Map<String, Double> paymentMethodTotals = new HashMap<>();
        Map<String, Integer> paymentMethodCounts = new HashMap<>();

        for (Expense expense : expenses) {
            if (expense.getExpense() != null) {
                String paymentMethod = expense.getExpense().getPaymentMethod();
                if (paymentMethod != null && !paymentMethod.isEmpty()) {
                    double amount = expense.getExpense().getAmount();
                    paymentMethodTotals.put(paymentMethod, paymentMethodTotals.getOrDefault(paymentMethod, 0.0) + amount);
                    paymentMethodCounts.put(paymentMethod, paymentMethodCounts.getOrDefault(paymentMethod, 0) + 1);
                }
            }
        }

        // Write payment method summary data
        int paymentMethodRowNum = 1;
        for (Map.Entry<String, Double> entry : paymentMethodTotals.entrySet()) {
            String paymentMethod = entry.getKey();
            Double totalAmount = entry.getValue();
            Integer expenseCount = paymentMethodCounts.get(paymentMethod);

            Row row = paymentMethodSheet.createRow(paymentMethodRowNum++);
            row.createCell(0).setCellValue(paymentMethod);
            row.createCell(1).setCellValue(totalAmount);
            row.createCell(2).setCellValue(expenseCount);
        }

        // Auto-size payment method columns
        for (int i = 0; i < 3; i++) {
            paymentMethodSheet.autoSizeColumn(i);
        }


        List<Budget> budgets = budgetService.getAllBudgetForUser(userId);
        Sheet budgetSheet = workbook.createSheet("Budgets");
        Row budgetHeader = budgetSheet.createRow(0);
        budgetHeader.createCell(0).setCellValue("Budget ID");
        budgetHeader.createCell(1).setCellValue("Name");
        budgetHeader.createCell(2).setCellValue("Description");
        budgetHeader.createCell(3).setCellValue("Amount");
        budgetHeader.createCell(4).setCellValue("Remaining Amount");
        budgetHeader.createCell(5).setCellValue("Start Date");
        budgetHeader.createCell(6).setCellValue("End Date");
        budgetHeader.createCell(7).setCellValue("Has Expenses");
        budgetHeader.createCell(8).setCellValue("Expenses Ids");

        int budgetRowNum = 1;
        for (Budget budget : budgets) {
            Row row = budgetSheet.createRow(budgetRowNum++);
            row.createCell(0).setCellValue(budget.getId());
            row.createCell(1).setCellValue(budget.getName());
            row.createCell(2).setCellValue(budget.getDescription());
            row.createCell(3).setCellValue(budget.getAmount());
            row.createCell(4).setCellValue(budget.getRemainingAmount());
            row.createCell(5).setCellValue(budget.getStartDate() != null ? budget.getStartDate().toString() : "");
            row.createCell(6).setCellValue(budget.getEndDate() != null ? budget.getEndDate().toString() : "");
            row.createCell(7).setCellValue(budget.isBudgetHasExpenses());
            row.createCell(8).setCellValue(budget.getExpenseIds() != null ? budget.getExpenseIds().toString() : "");
        }
        for (int i = 0; i < 9; i++) {
            budgetSheet.autoSizeColumn(i);
        }
        // Create the file
        String emailPrefix = user.getEmail().split("@")[0];  // Get the part before '@' in the email address
        String userFolderName = emailPrefix + "_" + userId;
        String userFolderPath = Paths.get(System.getProperty("user.home"), "reports", userFolderName).toString();

        File userFolder = new File(userFolderPath);
        if (!userFolder.exists()) {
            userFolder.mkdirs();
        }

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmmss");
        String timestamp = dateFormat.format(new Date());
        String filePath = Paths.get(userFolderPath, "expenses_report_" + timestamp + ".xlsx").toString();

        try (FileOutputStream fileOut = new FileOutputStream(filePath)) {
            workbook.write(fileOut);
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }


        workbook.close();

        return filePath;
    }

    @Override
    public ResponseEntity<String> generateAndSendMonthlyReport(ReportRequest request) {
        try {

            String reportsDir = System.getProperty("user.home") + "/reports";
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


            sendEmailWithAttachment(request.getToEmail(), "Monthly Expense Report", "Please find the attached monthly expense report.", reportPath.toString());

            return ResponseEntity.ok("Monthly report sent to " + request.getToEmail());
        } catch (IOException | MessagingException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to generate and send the report");
        }
    }

    @Override
    public void sendEmailWithAttachment(String toEmail, String subject, String body, String attachmentPath) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(body);
        helper.addAttachment("expenses_report.xlsx", new File(attachmentPath));

        mailSender.send(message);
    }
}
