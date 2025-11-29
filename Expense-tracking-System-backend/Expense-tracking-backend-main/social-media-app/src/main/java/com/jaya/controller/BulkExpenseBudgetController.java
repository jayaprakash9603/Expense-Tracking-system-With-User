package com.jaya.controller;

import com.jaya.dto.BulkExpenseBudgetRequest;
import com.jaya.dto.BulkExpenseBudgetResponse;
import com.jaya.dto.User;
import com.jaya.service.BulkExpenseBudgetService;
import com.jaya.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    /**
     * Endpoint for bulk creating expenses and budgets with automatic linking
     * 
     * POST /api/bulk/expenses-budgets
     * 
     * Request Body Example:
     * {
     *   "mappings": [
     *     {
     *       "expenses": [
     *         {
     *           "id": 240056,
     *           "date": "2025-11-28",
     *           "categoryId": 4,
     *           "categoryName": "Food",
     *           "expense": {
     *             "id": 240056,
     *             "expenseName": "Dates Syrup",
     *             "amount": 234.0,
     *             "type": "loss",
     *             "paymentMethod": "creditNeedToPaid",
     *             "netAmount": -234.0,
     *             "comments": "bought dates syrup",
     *             "creditDue": 234.0,
     *             "masked": false
     *           },
     *           "includeInBudget": true,
     *           "userId": 2,
     *           "budgetIds": [502],
     *           "bill": false
     *         }
     *       ],
     *       "budgets": [
     *         {
     *           "id": 502,
     *           "name": "November Food Budget",
     *           "description": "Monthly food expenses",
     *           "amount": 500.0,
     *           "startDate": "2025-11-01",
     *           "endDate": "2025-11-30",
     *           "userId": 2,
     *           "expenseIds": [240056],
     *           "remainingAmount": 266.0,
     *           "includeInBudget": true,
     *           "budgetHasExpenses": true
     *         }
     *       ]
     *     }
     *   ]
     * }
     * 
     * Note: Expenses and budgets are in separate arrays. No duplicates are created.
     * The service tracks old->new ID mappings to prevent duplicate creation.
     * 
     * @param request The bulk request containing expenses and budgets
     * @param token JWT token
     * @return Response with mapping results
     */
    @PostMapping("/expenses-budgets")
    public ResponseEntity<BulkExpenseBudgetResponse> createBulkExpensesAndBudgets(
        @RequestBody BulkExpenseBudgetRequest request,
        @RequestHeader("Authorization") String token
    ) {
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
                user.getId()
            );

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
     * Endpoint for recovering deleted expenses and budgets with their linkings
     * This is essentially the same as the bulk endpoint but semantically for recovery
     * 
     * POST /api/bulk/recover
     * 
     * @param request The recovery request containing old expenses and budgets
     * @param token JWT token
     * @return Response with recovery results
     */
    @PostMapping("/recover")
    public ResponseEntity<BulkExpenseBudgetResponse> recoverExpensesAndBudgets(
        @RequestBody BulkExpenseBudgetRequest request,
        @RequestHeader("Authorization") String token
    ) {
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

            // Use the same service method - recovery is just bulk creation with old ID tracking
            BulkExpenseBudgetResponse response = bulkExpenseBudgetService.processBulkExpensesAndBudgets(
                request, 
                user.getId()
            );

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
