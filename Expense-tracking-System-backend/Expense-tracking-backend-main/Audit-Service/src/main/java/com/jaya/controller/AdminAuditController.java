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

/**
 * Admin endpoints for audit log management.
 * These endpoints are intended for admin dashboard access.
 */
@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminAuditController {

    private final AuditExpenseService auditExpenseService;

    /**
     * Get all audit logs with pagination and optional filters.
     *
     * @param page       Page number (0-indexed)
     * @param size       Page size
     * @param search     Search query for username, action, or details
     * @param actionType Filter by action type (USER_MANAGEMENT, ROLE_MANAGEMENT,
     *                   etc.)
     * @param timeRange  Time range filter (24h, 7d, 30d, 90d)
     * @return Paginated audit logs
     */
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

            // Apply filters based on parameters
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

    /**
     * Get audit log statistics for the admin dashboard.
     *
     * @param timeRange Time range for statistics (24h, 7d, 30d, 90d)
     * @return Statistics including counts by action type
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAuditLogStats(
            @RequestParam(defaultValue = "7d") String timeRange) {

        try {
            LocalDateTime since = calculateTimeSince(timeRange);
            if (since == null) {
                since = LocalDateTime.now().minusDays(7);
            }

            // Get total count
            Long totalLogs = auditExpenseService.countAuditLogsSince(since);

            // Get statistics by action type
            List<Object[]> actionStats = auditExpenseService.getActionTypeStatistics(since);

            Map<String, Long> statsByType = new HashMap<>();
            for (Object[] stat : actionStats) {
                String type = (String) stat[0];
                Long count = (Long) stat[1];
                statsByType.put(type, count);
            }

            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("totalLogs", totalLogs);
            response.put("statsByType", statsByType);
            response.put("timeRange", timeRange);
            response.put("since", since.toString());

            // Add specific counts for common types
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

    /**
     * Get audit logs for a specific user.
     *
     * @param userId User ID
     * @param page   Page number
     * @param size   Page size
     * @return Paginated audit logs for the user
     */
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

    /**
     * Get audit logs for a specific entity (expense, budget, etc.).
     *
     * @param entityType Entity type (EXPENSE, BUDGET, USER, etc.)
     * @param entityId   Entity ID
     * @return List of audit logs for the entity
     */
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

    /**
     * Calculate the timestamp for 'since' based on time range string.
     */
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
                return now.minusDays(7); // Default to 7 days
        }
    }
}
