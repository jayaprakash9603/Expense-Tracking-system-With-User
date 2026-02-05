package com.jaya.controller;

import com.jaya.models.AuditExpense;

import com.jaya.models.UserDto;
import com.jaya.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    private EmailService emailService;

    @GetMapping("/audit-logs/all")
    public ResponseEntity<?> getAllAuditLogs(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            UserDto reqUser = userservice.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(401)
                        .body("Invalid or expired token");
            }

            UserDto targetUser;
            try {
                targetUser=reqUser;
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
            } catch (Exception e) {
                return ResponseEntity.status(404)
                        .body("User not found: " + e.getMessage());
            }

            List<AuditExpense> auditLogs = auditExpenseService.getAllAuditLogs(targetUser.getId());

            if (auditLogs.isEmpty()) {
                return ResponseEntity.status(204).build();
            }

            return ResponseEntity.ok(auditLogs);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Error retrieving audit logs: " + e.getMessage());
        }

    @GetMapping("/audit-logs/audit-types")
    public ResponseEntity<List<String>> getLogTypes() {
        List<String> logTypes = Arrays.asList(
                "Current Month Logs", "Last Month Logs", "Current Year Logs", "Last Year Logs",
                "Current Week Logs", "Last Week Logs", "Today Logs", "Logs for Specific Year",
                "Logs for Specific Month", "Logs for Specific Day", "Logs by Action Type",
                "Logs by Expense ID and Action Type", "Logs from Last N Minutes", "Logs from Last N Hours",
                "Logs from Last N Days", "Logs from Last N Seconds", "Logs from Last 5 Minutes",
                "All Audit Logs", "Logs by Expense ID");
        return ResponseEntity.ok(logTypes);
    }

}
