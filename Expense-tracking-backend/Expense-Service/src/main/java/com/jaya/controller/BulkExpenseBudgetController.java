package com.jaya.controller;

import com.jaya.dto.BulkExpenseBudgetRequest;
import com.jaya.dto.BulkExpenseBudgetResponse;
import com.jaya.dto.ProgressStatus;
import com.jaya.dto.User;
import com.jaya.service.BulkExpenseBudgetService;
import com.jaya.service.UserService;
import com.jaya.util.BulkProgressTracker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bulk")
@Slf4j
public class BulkExpenseBudgetController {

    @Autowired
    private BulkExpenseBudgetService bulkExpenseBudgetService;

    @Autowired
    private UserService userService;

    @Autowired
    private BulkProgressTracker progressTracker;

    @PostMapping("/expenses-budgets")
    public ResponseEntity<BulkExpenseBudgetResponse> createBulkExpensesAndBudgets(
            @RequestBody BulkExpenseBudgetRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            log.info("Received bulk expenses and budgets request");

            User user = userService.findUserByJwt(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(BulkExpenseBudgetResponse.builder()
                                .success(false)
                                .message("Invalid or expired token")
                                .build());
            }

            if (request.getMappings() == null || request.getMappings().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(BulkExpenseBudgetResponse.builder()
                                .success(false)
                                .message("Mappings cannot be empty")
                                .build());
            }

            BulkExpenseBudgetResponse response = bulkExpenseBudgetService.processBulkExpensesAndBudgets(
                    request,
                    user.getId());

            HttpStatus status = response.getSuccess() ? HttpStatus.OK : HttpStatus.PARTIAL_CONTENT;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error processing bulk expenses and budgets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BulkExpenseBudgetResponse.builder()
                            .success(false)
                            .message("Error processing bulk request: " + e.getMessage())
                            .build());
        }
    }

    @PostMapping("/expenses-budgets/tracked")
    public ResponseEntity<Map<String, String>> createBulkExpensesAndBudgetsTracked(
            @RequestBody BulkExpenseBudgetRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            log.info("Received tracked bulk expenses and budgets request");

            User user = userService.findUserByJwt(token);
            if (user == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            if (request.getMappings() == null || request.getMappings().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Mappings cannot be empty");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            int totalItems = 0;
            for (BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping : request.getMappings()) {
                totalItems += mapping.getExpenses() != null ? mapping.getExpenses().size() : 0;
                totalItems += mapping.getBudgets() != null ? mapping.getBudgets().size() : 0;
            }

            String jobId = progressTracker.start(
                    user.getId(),
                    totalItems,
                    String.format("Processing %d expenses and budgets", totalItems));

            log.info("Started async bulk processing with jobId: {} for {} items", jobId, totalItems);

            bulkExpenseBudgetService.processBulkExpensesAndBudgetsAsync(request, user.getId(), jobId);

            Map<String, String> response = new HashMap<>();
            response.put("jobId", jobId);
            response.put("message", String.format("Processing %d items", totalItems));
            response.put("totalItems", String.valueOf(totalItems));

            return ResponseEntity.accepted().body(response);

        } catch (Exception e) {
            log.error("Error starting tracked bulk expenses and budgets", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error starting bulk processing: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/expenses-budgets/progress/{jobId}")
    public ResponseEntity<ProgressStatus> getBulkProgress(
            @PathVariable String jobId,
            @RequestHeader("Authorization") String token) {
        try {
            User user = userService.findUserByJwt(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            ProgressStatus status = progressTracker.get(jobId);
            if (status == null) {
                return ResponseEntity.notFound().build();
            }

            if (!status.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(status);

        } catch (Exception e) {
            log.error("Error fetching progress for jobId: {}", jobId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/recover")
    public ResponseEntity<BulkExpenseBudgetResponse> recoverExpensesAndBudgets(
            @RequestBody BulkExpenseBudgetRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            log.info("Received recovery request for expenses and budgets");

            User user = userService.findUserByJwt(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(BulkExpenseBudgetResponse.builder()
                                .success(false)
                                .message("Invalid or expired token")
                                .build());
            }

            if (request.getMappings() == null || request.getMappings().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(BulkExpenseBudgetResponse.builder()
                                .success(false)
                                .message("Recovery mappings cannot be empty")
                                .build());
            }

            BulkExpenseBudgetResponse response = bulkExpenseBudgetService.processBulkExpensesAndBudgets(
                    request,
                    user.getId());

            HttpStatus status = response.getSuccess() ? HttpStatus.OK : HttpStatus.PARTIAL_CONTENT;
            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            log.error("Error recovering expenses and budgets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(BulkExpenseBudgetResponse.builder()
                            .success(false)
                            .message("Error during recovery: " + e.getMessage())
                            .build());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Bulk Expense-Budget Service is running");
    }
}
