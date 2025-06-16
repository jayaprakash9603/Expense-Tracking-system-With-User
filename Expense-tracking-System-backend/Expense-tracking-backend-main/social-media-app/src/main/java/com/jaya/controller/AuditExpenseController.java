package com.jaya.controller;

import com.jaya.exceptions.UserException;
import com.jaya.models.AuditExpense;
import com.jaya.models.User;
import com.jaya.service.*;

import jakarta.mail.MessagingException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AuditExpenseController {

    @Autowired
    private AuditExpenseService auditExpenseService;

    @Autowired
    private UserService userservice;

    @Autowired
    private FriendshipService friendshipService;


    private User getTargetUserWithPermissionCheck(Integer targetId, User reqUser, boolean needWriteAccess) throws UserException {
        if (targetId == null) {
            return reqUser;
        }

        User targetUser = userservice.findUserById(targetId);
        if (targetUser == null) {
            throw new RuntimeException("Target user not found");
        }

        boolean hasAccess = needWriteAccess ?
                friendshipService.canUserModifyExpenses(targetId, reqUser.getId()) :
                friendshipService.canUserAccessExpenses(targetId, reqUser.getId());

        if (!hasAccess) {
            String action = needWriteAccess ? "modify" : "access";
            throw new RuntimeException("You don't have permission to " + action + " this user's expenses");
        }

        return targetUser;
    }

    @GetMapping("/audit-logs/expenses/{expenseId}")
    public ResponseEntity<List<AuditExpense>> getAuditLogsForExpense(@PathVariable Integer expenseId) {
        List<AuditExpense> auditLogs = auditExpenseService.getAuditLogsForExpense(expenseId);

        if (auditLogs.isEmpty()) {
            return ResponseEntity.status(404).body(null);  // Return 404 if no logs found
        }

        return ResponseEntity.ok(auditLogs);
    }
    @GetMapping("/audit-logs/all")
    public ResponseEntity<?> getAllAuditLogs(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            // Get authenticated user
            User reqUser = userservice.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(401)
                        .body("Invalid or expired token");
            }

            // Determine target user (if admin is viewing another user's logs)
            User targetUser;
            try {
                targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            } catch (RuntimeException e) {
                if (e.getMessage().contains("not found")) {
                    return ResponseEntity.status(404)
                            .body("Target user not found");
                } else if (e.getMessage().contains("permission")) {
                    return ResponseEntity.status(403)
                            .body(e.getMessage());
                } else {
                    throw e;
                }
            } catch (UserException e) {
                return ResponseEntity.status(404)
                        .body("User not found: " + e.getMessage());
            }

            // Get audit logs for the target user
            List<AuditExpense> auditLogs = auditExpenseService.getAllAuditLogs(targetUser);

            if (auditLogs.isEmpty()) {
                return ResponseEntity.status(204).build(); // No content
            }

            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Error retrieving audit logs: " + e.getMessage());
        }
    }
    
    @GetMapping("/audit-logs/last-5-minutes")
    public ResponseEntity<List<AuditExpense>> getLastFiveMinutesLogs() {
        List<AuditExpense> logs = auditExpenseService.getLogsFromLastFiveMinutes();
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/audit-logs/last-n-minutes")
    public ResponseEntity<List<AuditExpense>> getLastNMinutesLogs(@RequestParam int minutes) {
        if (minutes <= 0) {
            return ResponseEntity.badRequest().body(null); // Ensure minutes is positive
        }
        List<AuditExpense> logs = auditExpenseService.getLogsFromLastNMinutes(minutes);
        return ResponseEntity.ok(logs);
    }
    
    
    @GetMapping("/audit-logs/last-n-hours")
    public ResponseEntity<List<AuditExpense>> getLastNHoursLogs(@RequestParam int hours) {
        if (hours <= 0) {
            return ResponseEntity.badRequest().body(null); // Ensure hours is positive
        }
        List<AuditExpense> logs = auditExpenseService.getLogsFromLastNHours(hours);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/audit-logs/last-n-days")
    public ResponseEntity<List<AuditExpense>> getLastNDaysLogs(@RequestParam int days) {
        if (days <= 0) {
            return ResponseEntity.badRequest().body(null); // Ensure days is positive
        }
        List<AuditExpense> logs = auditExpenseService.getLogsFromLastNDays(days);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/audit-logs/last-n-seconds")
    public ResponseEntity<List<AuditExpense>> getLastNSecondsLogs(@RequestParam int seconds) {
        if (seconds <= 0) {
            return ResponseEntity.badRequest().body(null); // Ensure seconds is positive
        }
        List<AuditExpense> logs = auditExpenseService.getLogsFromLastNSeconds(seconds);
        return ResponseEntity.ok(logs);
    }
    @GetMapping("/audit-logs/day")
    public List<AuditExpense> getLogsForDate(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);  // Parse the date (format yyyy-MM-dd)
        return auditExpenseService.getLogsForSpecificDay(localDate);
    }
    @GetMapping("/audit-logs/action/{actionType}")
    public List<AuditExpense> getLogsByActionType(@PathVariable String actionType) {
        return auditExpenseService.getLogsByActionType(actionType);
    }
    @GetMapping("/audit-logs/expense/{expenseId}/action/{actionType}")
    public List<AuditExpense> getLogsByExpenseIdAndAction(@PathVariable Integer expenseId, @PathVariable String actionType) {
        return auditExpenseService.getLogsByExpenseIdAndActionType(expenseId, actionType);
    }
    
    @Autowired
    private ExcelService excelService;

    @Autowired
    private EmailService emailService;
    @GetMapping("/audit-logs/last-5-minutes/email")
    public ResponseEntity<String> sendLastFiveMinutesLogsByEmail(@RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsFromLastFiveMinutes();

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs from Last 5 Minutes";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs from the last 5 minutes.", new ByteArrayResource(bytes), "audit_logs_last_5_minutes.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/audit-logs/expenses/{expenseId}/email")
    public ResponseEntity<String> sendAuditLogsForExpenseByEmail(
            @PathVariable Integer expenseId,
            @RequestParam String email) throws IOException, MessagingException {

        List<AuditExpense> auditLogs = auditExpenseService.getAuditLogsForExpense(expenseId);

        if (auditLogs.isEmpty()) {
            return ResponseEntity.status(404).body("No audit logs found for the specified expense ID");
        }

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(auditLogs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs for Expense ID " + expenseId;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs for the specified expense.", new ByteArrayResource(bytes), "audit_logs_expense_" + expenseId + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    

    @GetMapping("/audit-logs/all/email")
    public ResponseEntity<String> sendAllAuditLogsByEmail(@RequestParam String email,@RequestParam("Authorization")String jwt) throws IOException, MessagingException {
        User reqUser=userservice.findUserByJwt(jwt);
        List<AuditExpense> auditLogs = auditExpenseService.getAllAuditLogs(reqUser);

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(auditLogs);
        byte[] bytes = in.readAllBytes();

        String subject = "All Audit Logs";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached all audit logs.", new ByteArrayResource(bytes), "all_audit_logs.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }

    @GetMapping("/audit-logs/last-n-minutes/email")
    public ResponseEntity<String> sendLastNMinutesLogsByEmail(@RequestParam int minutes, @RequestParam String email) throws IOException, MessagingException {
        if (minutes <= 0) {
            return ResponseEntity.badRequest().body("Minutes must be positive");
        }

        List<AuditExpense> logs = auditExpenseService.getLogsFromLastNMinutes(minutes);

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs from Last " + minutes + " Minutes";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs from the last " + minutes + " minutes.", new ByteArrayResource(bytes), "audit_logs_last_" + minutes + "_minutes.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/audit-logs/last-n-hours/email")
    public ResponseEntity<String> sendLastNHoursLogsByEmail(@RequestParam int hours, @RequestParam String email) throws IOException, MessagingException {
        if (hours <= 0) {
            return ResponseEntity.badRequest().body("Hours must be positive");
        }

        List<AuditExpense> logs = auditExpenseService.getLogsFromLastNHours(hours);

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs from Last " + hours + " Hours";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs from the last " + hours + " hours.", new ByteArrayResource(bytes), "audit_logs_last_" + hours + "_hours.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    

    @GetMapping("/audit-logs/last-n-days/email")
    public ResponseEntity<String> sendLastNDaysLogsByEmail(@RequestParam int days, @RequestParam String email) throws IOException, MessagingException {
        if (days <= 0) {
            return ResponseEntity.badRequest().body("Days must be positive");
        }

        List<AuditExpense> logs = auditExpenseService.getLogsFromLastNDays(days);

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs from Last " + days + " Days";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs from the last " + days + " days.", new ByteArrayResource(bytes), "audit_logs_last_" + days + "_days.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/audit-logs/last-n-seconds/email")
    public ResponseEntity<String> sendLastNSecondsLogsByEmail(@RequestParam int seconds, @RequestParam String email) throws IOException, MessagingException {
        if (seconds <= 0) {
            return ResponseEntity.badRequest().body("Seconds must be positive");
        }

        List<AuditExpense> logs = auditExpenseService.getLogsFromLastNSeconds(seconds);

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs from Last " + seconds + " Seconds";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs from the last " + seconds + " seconds.", new ByteArrayResource(bytes), "audit_logs_last_" + seconds + "_seconds.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    

    @GetMapping("/audit-logs/day/email")
    public ResponseEntity<String> sendLogsForDateByEmail(@RequestParam String date, @RequestParam String email) throws IOException, MessagingException {
        LocalDate localDate = LocalDate.parse(date);  // Parse the date (format yyyy-MM-dd)
        List<AuditExpense> logs = auditExpenseService.getLogsForSpecificDay(localDate);

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs for " + date;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs for " + date + ".", new ByteArrayResource(bytes), "audit_logs_" + date + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/audit-logs/action/{actionType}/email")
    public ResponseEntity<String> sendLogsByActionTypeByEmail(@PathVariable String actionType, @RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsByActionType(actionType);

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs for Action Type: " + actionType;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs for action type: " + actionType + ".", new ByteArrayResource(bytes), "audit_logs_action_" + actionType + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/audit-logs/expense/{expenseId}/action/{actionType}/email")
    public ResponseEntity<String> sendLogsByExpenseIdAndActionByEmail(@PathVariable Integer expenseId, @PathVariable String actionType, @RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsByExpenseIdAndActionType(expenseId, actionType);

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs for Expense ID: " + expenseId + " and Action Type: " + actionType;
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs for expense ID: " + expenseId + " and action type: " + actionType + ".", new ByteArrayResource(bytes), "audit_logs_expense_" + expenseId + "_action_" + actionType + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    

    @GetMapping("/audit-logs/today")
    public ResponseEntity<List<AuditExpense>> getLogsForToday() {
        List<AuditExpense> logs = auditExpenseService.getLogsForToday();
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/audit-logs/today/email")
    public ResponseEntity<String> sendTodayLogsByEmail(@RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForToday();

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        String subject = "Audit Logs for Today";
        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs for today.", new ByteArrayResource(bytes), "audit_logs_today.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    
    @GetMapping("/audit-logs/yesterday")
    public ResponseEntity<List<AuditExpense>> getLogsForYesterday() {
        List<AuditExpense> logs = auditExpenseService.getLogsForYesterday();
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/audit-logs/current-month")
    public ResponseEntity<List<AuditExpense>> getLogsForCurrentMonth() {
        List<AuditExpense> logs = auditExpenseService.getLogsForCurrentMonth();
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/last-month")
    public ResponseEntity<List<AuditExpense>> getLogsForLastMonth() {
        List<AuditExpense> logs = auditExpenseService.getLogsForLastMonth();
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/current-week")
    public ResponseEntity<List<AuditExpense>> getLogsForCurrentWeek() {
        List<AuditExpense> logs = auditExpenseService.getLogsForCurrentWeek();
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/last-week")
    public ResponseEntity<List<AuditExpense>> getLogsForLastWeek() {
        List<AuditExpense> logs = auditExpenseService.getLogsForLastWeek();
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/current-year")
    public ResponseEntity<List<AuditExpense>> getLogsForCurrentYear() {
        List<AuditExpense> logs = auditExpenseService.getLogsForCurrentYear();
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/last-year")
    public ResponseEntity<List<AuditExpense>> getLogsForLastYear() {
        List<AuditExpense> logs = auditExpenseService.getLogsForLastYear();
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/year/{year}")
    public ResponseEntity<List<AuditExpense>> getLogsForYear(@PathVariable int year) {
        List<AuditExpense> logs = auditExpenseService.getLogsForYear(year);
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/audit-logs/month")
    public ResponseEntity<List<AuditExpense>> getLogsForMonth(@RequestParam int year, @RequestParam int month) {
        List<AuditExpense> logs = auditExpenseService.getLogsForMonth(year, month);
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(logs);
    }
    

    @GetMapping("/audit-logs/yesterday/email")
    public ResponseEntity<String> sendYesterdayLogsByEmail(@RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForYesterday();
        return sendLogsByEmail(email, logs, "Audit Logs for Yesterday");
    }

    @GetMapping("/audit-logs/current-month/email")
    public ResponseEntity<String> sendCurrentMonthLogsByEmail(@RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForCurrentMonth();
        return sendLogsByEmail(email, logs, "Audit Logs for Current Month");
    }

    @GetMapping("/audit-logs/last-month/email")
    public ResponseEntity<String> sendLastMonthLogsByEmail(@RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForLastMonth();
        return sendLogsByEmail(email, logs, "Audit Logs for Last Month");
    }

    @GetMapping("/audit-logs/current-week/email")
    public ResponseEntity<String> sendCurrentWeekLogsByEmail(@RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForCurrentWeek();
        return sendLogsByEmail(email, logs, "Audit Logs for Current Week");
    }

    @GetMapping("/audit-logs/last-week/email")
    public ResponseEntity<String> sendLastWeekLogsByEmail(@RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForLastWeek();
        return sendLogsByEmail(email, logs, "Audit Logs for Last Week");
    }

    @GetMapping("/audit-logs/current-year/email")
    public ResponseEntity<String> sendCurrentYearLogsByEmail(@RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForCurrentYear();
        return sendLogsByEmail(email, logs, "Audit Logs for Current Year");
    }
    

    @GetMapping("/audit-logs/last-year/email")
    public ResponseEntity<String> sendLastYearLogsByEmail(@RequestParam String email) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForLastYear();
        return sendLogsByEmail(email, logs, "Audit Logs for Last Year");
    }

    @GetMapping("/audit-logs/year/{year}/email")
    public ResponseEntity<String> sendLogsForYearByEmail(@RequestParam String email, @PathVariable int year) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForYear(year);
        return sendLogsByEmail(email, logs, "Audit Logs for Year " + year);
    }

    @GetMapping("/audit-logs/month/email")
    public ResponseEntity<String> sendLogsForMonthByEmail(@RequestParam String email, @RequestParam int year, @RequestParam int month) throws IOException, MessagingException {
        List<AuditExpense> logs = auditExpenseService.getLogsForMonth(year, month);
        return sendLogsByEmail(email, logs, "Audit Logs for " + month + "/" + year);
    }

    private ResponseEntity<String> sendLogsByEmail(String email, List<AuditExpense> logs, String subject) throws IOException, MessagingException {
        if (logs.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        ByteArrayInputStream in = excelService.generateAuditLogsExcel(logs);
        byte[] bytes = in.readAllBytes();

        emailService.sendEmailWithAttachment(email, subject, "Please find attached the audit logs.", new ByteArrayResource(bytes), "audit_logs.xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }
    

    @GetMapping("/audit-logs/audit-types")
    public ResponseEntity<List<String>> getLogTypes() {
        List<String> logTypes = Arrays.asList(
	            "Current Month Logs", "Last Month Logs", "Current Year Logs", "Last Year Logs",
	            "Current Week Logs", "Last Week Logs", "Today Logs", "Logs for Specific Year",
	            "Logs for Specific Month", "Logs for Specific Day", "Logs by Action Type",
	            "Logs by Expense ID and Action Type", "Logs from Last N Minutes", "Logs from Last N Hours",
	            "Logs from Last N Days", "Logs from Last N Seconds", "Logs from Last 5 Minutes",
	            "All Audit Logs", "Logs by Expense ID"
        );
        return ResponseEntity.ok(logTypes);
    }
    
    
}
