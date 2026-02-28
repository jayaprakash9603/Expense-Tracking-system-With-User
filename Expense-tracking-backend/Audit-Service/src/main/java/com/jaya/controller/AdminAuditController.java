package com.jaya.controller;

import com.jaya.models.AuditExpense;
import com.jaya.service.AuditExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@Slf4j
public class AdminAuditController {

    private final AuditExpenseService auditExpenseService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String actionType,
            @RequestParam(defaultValue = "7d") String timeRange) {

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AuditExpense> auditPage;

            LocalDateTime since = calculateTimeSince(timeRange);

            if (search != null && !search.isEmpty()) {
                if (actionType != null && !actionType.equals("all")) {
                    auditPage = auditExpenseService.searchAuditLogsByType(search, actionType, pageable);
                } else {
                    auditPage = auditExpenseService.searchAuditLogs(search, pageable);
                }
            } else if (actionType != null && !actionType.equals("all")) {
                if (since != null) {
                    auditPage = auditExpenseService.getAuditLogsByTypeAndTime(actionType, since, pageable);
                } else {
                    auditPage = auditExpenseService.getAuditLogsByType(actionType, pageable);
                }
            } else if (since != null) {
                auditPage = auditExpenseService.getAuditLogsSince(since, pageable);
            } else {
                auditPage = auditExpenseService.getAllAuditLogsPaginated(pageable);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("content", auditPage.getContent());
            response.put("currentPage", auditPage.getNumber());
            response.put("totalItems", auditPage.getTotalElements());
            response.put("totalPages", auditPage.getTotalPages());
            response.put("size", auditPage.getSize());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching audit logs: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch audit logs");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAuditLogStats(
            @RequestParam(defaultValue = "7d") String timeRange) {

        try {
            LocalDateTime since = calculateTimeSince(timeRange);
            if (since == null) {
                since = LocalDateTime.now().minusDays(7);
            }

            Long totalLogs = auditExpenseService.countAuditLogsSince(since);

            List<Object[]> actionStats = auditExpenseService.getActionTypeStatistics(since);

            Map<String, Long> statsByType = new HashMap<>();
            for (Object[] stat : actionStats) {
                String type = (String) stat[0];
                Long count = (Long) stat[1];
                statsByType.put(type, count);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("totalLogs", totalLogs);
            response.put("statsByType", statsByType);
            response.put("timeRange", timeRange);
            response.put("since", since.toString());

            response.put("userManagement", statsByType.getOrDefault("USER_MANAGEMENT", 0L));
            response.put("roleManagement", statsByType.getOrDefault("ROLE_MANAGEMENT", 0L));
            response.put("dataModification", statsByType.getOrDefault("DATA_MODIFICATION", 0L));
            response.put("authentication", statsByType.getOrDefault("AUTHENTICATION", 0L) +
                    statsByType.getOrDefault("LOGIN", 0L) + statsByType.getOrDefault("LOGOUT", 0L));
            response.put("reportGeneration", statsByType.getOrDefault("REPORT_GENERATION", 0L));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching audit stats: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch audit statistics");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getAuditLogsForUser(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AuditExpense> auditPage = auditExpenseService.getAuditTrailForUser(userId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("content", auditPage.getContent());
            response.put("currentPage", auditPage.getNumber());
            response.put("totalItems", auditPage.getTotalElements());
            response.put("totalPages", auditPage.getTotalPages());
            response.put("size", auditPage.getSize());
            response.put("userId", userId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching audit logs for user {}: {}", userId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch user audit logs");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/entity")
    public ResponseEntity<?> getAuditLogsForEntity(
            @RequestParam String entityType,
            @RequestParam String entityId) {

        try {
            List<AuditExpense> auditLogs = auditExpenseService.getAuditTrailForEntity(entityType, entityId);

            Map<String, Object> response = new HashMap<>();
            response.put("content", auditLogs);
            response.put("totalItems", auditLogs.size());
            response.put("entityType", entityType);
            response.put("entityId", entityId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching audit logs for entity {}/{}: {}", entityType, entityId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch entity audit logs");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    private LocalDateTime calculateTimeSince(String timeRange) {
        if (timeRange == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        switch (timeRange) {
            case "24h":
                return now.minusHours(24);
            case "7d":
                return now.minusDays(7);
            case "30d":
                return now.minusDays(30);
            case "90d":
                return now.minusDays(90);
            case "all":
                return null;
            default:
                return now.minusDays(7);
        }
    }
}
