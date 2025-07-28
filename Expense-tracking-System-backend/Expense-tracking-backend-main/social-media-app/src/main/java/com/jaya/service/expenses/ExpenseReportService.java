//package com.jaya.service.expenses;
//
//
//import com.jaya.models.ExpenseReport;
//import com.jaya.models.ReportRequest;
//import org.springframework.http.ResponseEntity;
//import jakarta.mail.MessagingException;
//
///**
// * Service for expense reporting and export operations
// */
//public interface ExpenseReportService {
//
//    // Report generation
//    ExpenseReport generateExpenseReport(Integer expenseId, Integer userId);
//    String generateExcelReport(Integer userId) throws Exception;
//
//    // Email operations
//    void sendEmailWithAttachment(String toEmail, String subject, String body, String attachmentPath) throws MessagingException;
//    ResponseEntity<String> generateAndSendMonthlyReport(ReportRequest request);
//
//    // Comment operations
//    String getCommentsForExpense(Integer expenseId, Integer userId);
//    String removeCommentFromExpense(Integer expenseId, Integer userId);
//}
