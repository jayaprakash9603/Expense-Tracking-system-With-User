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

/**
 * Controller for handling bulk expense and budget creation with linking
 */
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

    /**
     * Endpoint for bulk creating expenses and budgets with automatic linking
     * 
     * POST /api/bulk/expenses-budgets
     * 
     * Request Body Example:
     * {
     * "mappings": [
     * {
     * "expenses": [
     * {
     * "id": 240056,
     * "date": "2025-11-28",
     * "categoryId": 4,
     * "categoryName": "Food",
     * "expense": {
     * "id": 240056,
     * "expenseName": "Dates Syrup",
     * "amount": 234.0,
     * "type": "loss",
     * "paymentMethod": "creditNeedToPaid",
     * "netAmount": -234.0,
     * "comments": "bought dates syrup",
     * "creditDue": 234.0,
     * "masked": false
     * },
     * "includeInBudget": true,
     * "userId": 2,
     * "budgetIds": [502],
     * "bill": false
     * }
     * ],
     * "budgets": [
     * {
     * "id": 502,
     * "name": "November Food Budget",
     * "description": "Monthly food expenses",
     * "amount": 500.0,
     * "startDate": "2025-11-01",
     * "endDate": "2025-11-30",
     * "userId": 2,
     * "expenseIds": [240056],
     * "remainingAmount": 266.0,
     * "includeInBudget": true,
     * "budgetHasExpenses": true
     * }
     * ]
     * }
     * ]
     * }
     * 
     * Note: Expenses and budgets are in separate arrays. No duplicates are created.
     * The service tracks old->new ID mappings to prevent duplicate creation.
     * 
     * @param request The bulk request containing expenses and budgets
     * @param token   JWT token
     * @return Response with mapping results
     */
    @PostMapping("/expenses-budgets")
    public ResponseEntity<BulkExpenseBudgetResponse> createBulkExpensesAndBudgets(
            @RequestBody BulkExpenseBudgetRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            log.info("Received bulk expenses and budgets request");

            // Extract user from token
            User user = userService.findUserByJwt(token);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(BulkExpenseBudgetResponse.builder()
                                .success(false)
                                .message("Invalid or expired token")
                                .build());
            }

            // Validate request
            if (request.getMappings() == null || request.getMappings().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(BulkExpenseBudgetResponse.builder()
                                .success(false)
                                .message("Mappings cannot be empty")
                                .build());
            }

            // Process the bulk request
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

    /**
     * HIGH-PERFORMANCE ASYNC ENDPOINT
     * Asynchronous bulk expense and budget creation with progress tracking
     * Optimized for processing 1000s of records using CompletableFuture and
     * parallel processing
     * 
     * POST /api/bulk/expenses-budgets/tracked
     * 
     * Returns a jobId immediately for polling progress
     * Frontend polls /api/bulk/expenses-budgets/progress/{jobId} for status
     * 
     * Performance:
     * - Uses all 4 CPU cores with parallel batch processing
     * - Processes 100 items per batch
     * - CompletableFuture for concurrent execution
     * - Progress updates every 50 items
     * 
     * Example Response:
     * {
     * "jobId": "550e8400-e29b-41d4-a716-446655440000"
     * }
     * 
     * @param request The bulk request containing expenses and budgets
     * @param token   JWT token
     * @return Response with jobId for tracking
     */
    @PostMapping("/expenses-budgets/tracked")
    public ResponseEntity<Map<String, String>> createBulkExpensesAndBudgetsTracked(
            @RequestBody BulkExpenseBudgetRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            log.info("Received tracked bulk expenses and budgets request");

            // Extract user from token
            User user = userService.findUserByJwt(token);
            if (user == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // Validate request
            if (request.getMappings() == null || request.getMappings().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Mappings cannot be empty");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Calculate total items
            int totalItems = 0;
            for (BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping : request.getMappings()) {
                totalItems += mapping.getExpenses() != null ? mapping.getExpenses().size() : 0;
                totalItems += mapping.getBudgets() != null ? mapping.getBudgets().size() : 0;
            }

            // Start progress tracking
            String jobId = progressTracker.start(
                    user.getId(),
                    totalItems,
                    String.format("Processing %d expenses and budgets", totalItems));

            log.info("Started async bulk processing with jobId: {} for {} items", jobId, totalItems);

            // Process asynchronously
            bulkExpenseBudgetService.processBulkExpensesAndBudgetsAsync(request, user.getId(), jobId);

            // Return jobId immediately
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

    /**
     * Poll progress for a tracked bulk operation
     * 
     * GET /api/bulk/expenses-budgets/progress/{jobId}
     * 
     * Example Response:
     * {
     * "jobId": "550e8400-e29b-41d4-a716-446655440000",
     * "status": "IN_PROGRESS",
     * "processed": 750,
     * "total": 1000,
     * "percent": 75,
     * "message": "Processing...",
     * "userId": 2,
     * "createdAt": "2025-11-29T10:00:00",
     * "updatedAt": "2025-11-29T10:00:15"
     * }
     * 
     * @param jobId The job ID returned from tracked endpoint
     * @param token JWT token
     * @return Progress status
     */
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

            // Verify user owns this job
            if (!status.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(status);

        } catch (Exception e) {
            log.error("Error fetching progress for jobId: {}", jobId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint for recovering deleted expenses and budgets with their linkings
     * This is essentially the same as the bulk endpoint but semantically for
     * recovery
     * 
     * POST /api/bulk/recover
     * 
     * @param request The recovery request containing old expenses and budgets
     * @param token   JWT token
     * @return Response with recovery results
     */
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

            // Use the same service method - recovery is just bulk creation with old ID
            // tracking
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

    /**
     * Health check endpoint
     * 
     * GET /api/bulk/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Bulk Expense-Budget Service is running");
    }
}
