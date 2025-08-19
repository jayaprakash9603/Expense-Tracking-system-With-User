package com.jaya.service.expenses;


import com.jaya.models.ExpenseReport;
import com.jaya.models.ReportRequest;
import jakarta.mail.MessagingException;
import org.springframework.http.ResponseEntity;


import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service for expense report generation and export 18 methods
 */
public interface ExpenseReportService {

    // Report generation
    ExpenseReport generateExpenseReport(Integer expenseId, Integer userId);
    String generateExcelReport(Integer userId) throws Exception;
//    String generatePdfReport(Integer userId) throws Exception;
//    String generateCsvReport(Integer userId) throws Exception;

    // Monthly reports
    ResponseEntity<String> generateAndSendMonthlyReport(ReportRequest request);
//    Map<String, Object> generateMonthlyReportData(Integer userId, int month, int year);
//    Map<String, Object> generateYearlyReportData(Integer userId, int year);

    // Custom reports
//    Map<String, Object> generateCustomReport(Integer userId, LocalDate startDate, LocalDate endDate,
//                                             String reportType, Map<String, Object> filters);

    // Email reports
    void sendEmailWithAttachment(String toEmail, String subject, String body, String attachmentPath) throws MessagingException;
//    void sendMonthlyReportEmail(Integer userId, String email, int month, int year) throws Exception;
//    void sendWeeklyReportEmail(Integer userId, String email) throws Exception;

    // Report templates
//    String generateReportFromTemplate(Integer userId, String templateName, Map<String, Object> parameters) throws Exception;
//    List<String> getAvailableReportTemplates();

    // Report scheduling
//    void scheduleMonthlyReport(Integer userId, String email);
//    void scheduleWeeklyReport(Integer userId, String email);
//    void cancelScheduledReports(Integer userId);

    // Report analytics
//    Map<String, Object> getReportGenerationStats(Integer userId);
//    List<Map<String, Object>> getReportHistory(Integer userId, int limit);
}