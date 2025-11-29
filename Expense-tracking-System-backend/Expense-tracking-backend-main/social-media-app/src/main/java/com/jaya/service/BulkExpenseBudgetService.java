package com.jaya.service;

import com.jaya.dto.*;
import com.jaya.exceptions.UserException;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.repository.ExpenseRepository;
import com.jaya.util.BulkProgressTracker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Service for handling bulk expense and budget creation with linking and
 * recovery
 */
@Service
@Slf4j
public class BulkExpenseBudgetService {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private BulkProgressTracker progressTracker;

    private static final String EXPENSE_BUDGET_LINKING_TOPIC = "expense-budget-linking-events";
    private static final int BATCH_SIZE = 100; // Process in batches for optimal performance
    private static final int PROGRESS_UPDATE_INTERVAL = 50; // Update progress every 50 items

    /**
     * Publish Kafka event after transaction commits
     * This ensures the data is visible in the database before consumers try to read
     * it
     */
    private void publishAfterCommit(Object event) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
                }
            });
        } else {
            // If no transaction is active, send immediately
            kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
        }
    }

    /**
     * Process bulk expense and budget creation with automatic linking
     * Updated to handle expenses and budgets in separate arrays
     * 
     * @param request The bulk request containing expenses and budgets
     * @param userId  The user ID
     * @return Response with mapping results
     */
    @Transactional
    public BulkExpenseBudgetResponse processBulkExpensesAndBudgets(BulkExpenseBudgetRequest request, Integer userId) {
        log.info("Processing bulk expense and budget request for user: {} with {} mappings", userId,
                request.getMappings() != null ? request.getMappings().size() : 0);

        // Validate request
        if (request.getMappings() == null || request.getMappings().isEmpty()) {
            log.warn("Empty mappings received for user: {}", userId);
            return BulkExpenseBudgetResponse.builder()
                    .success(false)
                    .message("No mappings provided")
                    .totalProcessed(0)
                    .successCount(0)
                    .failureCount(0)
                    .results(new ArrayList<>())
                    .oldToNewExpenseIds(new HashMap<>())
                    .oldToNewBudgetIds(new HashMap<>())
                    .build();
        }

        Map<Long, Long> oldToNewExpenseIds = new HashMap<>();
        Map<Long, Long> oldToNewBudgetIds = new HashMap<>();
        List<BulkExpenseBudgetResponse.MappingResult> results = new ArrayList<>();

        int successCount = 0;
        int failureCount = 0;

        // Process each mapping group
        for (BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping : request.getMappings()) {
            try {
                // Validate mapping
                if (mapping.getExpenses() == null || mapping.getExpenses().isEmpty()) {
                    log.error("Null or empty expenses in mapping");
                    failureCount++;
                    results.add(BulkExpenseBudgetResponse.MappingResult.builder()
                            .oldExpenseId(null)
                            .success(false)
                            .errorMessage("Expenses array is null or empty")
                            .build());
                    continue;
                }

                // Process all expenses and budgets in this mapping
                processMappingGroup(
                        mapping,
                        userId,
                        oldToNewExpenseIds,
                        oldToNewBudgetIds,
                        results);

                // Count successes and failures from results
                long groupSuccess = results.stream()
                        .filter(r -> r.getSuccess() != null && r.getSuccess())
                        .count();
                long groupFailure = results.stream()
                        .filter(r -> r.getSuccess() != null && !r.getSuccess())
                        .count();

                successCount = (int) groupSuccess;
                failureCount = (int) groupFailure;

            } catch (Exception e) {
                log.error("Error processing mapping group", e);
                failureCount++;
            }
        }

        log.info("Completed bulk processing for user {}: {} total, {} successful, {} failed",
                userId, results.size(), successCount, failureCount);

        return BulkExpenseBudgetResponse.builder()
                .success(failureCount == 0)
                .message(String.format("Processed %d items: %d successful, %d failed",
                        results.size(), successCount, failureCount))
                .totalProcessed(results.size())
                .successCount(successCount)
                .failureCount(failureCount)
                .results(results)
                .oldToNewExpenseIds(oldToNewExpenseIds)
                .oldToNewBudgetIds(oldToNewBudgetIds)
                .build();
    }

    /**
     * Process a mapping group containing arrays of expenses and budgets
     */
    private void processMappingGroup(
            BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping,
            Integer userId,
            Map<Long, Long> oldToNewExpenseIds,
            Map<Long, Long> oldToNewBudgetIds,
            List<BulkExpenseBudgetResponse.MappingResult> results) {
        log.info("Processing mapping group with {} expenses and {} budgets",
                mapping.getExpenses().size(),
                mapping.getBudgets() != null ? mapping.getBudgets().size() : 0);

        // Step 1: Publish budget creation events FIRST (so Budget Service creates them
        // before expenses need them)
        if (mapping.getBudgets() != null && !mapping.getBudgets().isEmpty()) {
            for (BulkExpenseBudgetRequest.BudgetData budgetData : mapping.getBudgets()) {
                try {
                    Long oldBudgetId = budgetData.getId();

                    // Check if this budget was already processed
                    if (oldToNewBudgetIds.containsKey(oldBudgetId)) {
                        log.info("Budget {} already processed, skipping duplicate", oldBudgetId);
                        continue;
                    }

                    // Publish event to Budget Service to create budget
                    // Note: We haven't created expenses yet, so we pass the current
                    // oldToNewExpenseIds mapping
                    publishBudgetCreationEvent(
                            budgetData,
                            null, // No single old expense ID (multiple expenses may reference this budget)
                            null, // No single new expense ID
                            userId,
                            oldToNewExpenseIds);

                    // Mark as pending (will be updated via Kafka when Budget Service creates it)
                    oldToNewBudgetIds.put(oldBudgetId, null);

                    log.info("Published budget creation event for old budget ID: {}", oldBudgetId);

                } catch (Exception e) {
                    log.error("Error processing budget ID: {}", budgetData.getId(), e);
                }
            }
        }

        // Step 2: Create all expenses and track old->new ID mappings
        for (BulkExpenseBudgetRequest.ExpenseData expenseData : mapping.getExpenses()) {
            try {
                Long oldExpenseId = expenseData.getId();

                // Check if this expense was already created
                if (oldToNewExpenseIds.containsKey(oldExpenseId)) {
                    log.info("Expense {} already created, skipping duplicate", oldExpenseId);
                    continue;
                }

                // Create the expense
                Expense newExpense = createExpenseFromData(expenseData, userId);
                Long newExpenseId = newExpense.getId().longValue();
                oldToNewExpenseIds.put(oldExpenseId, newExpenseId);

                log.info("Created expense: old ID {} -> new ID {}", oldExpenseId, newExpenseId);

                // Publish event if expense has old budget IDs
                if (expenseData.getBudgetIds() != null && !expenseData.getBudgetIds().isEmpty()) {
                    // Check if these budgets were just created or already exist
                    boolean budgetsJustCreated = expenseData.getBudgetIds().stream()
                            .anyMatch(oldToNewBudgetIds::containsKey);

                    if (budgetsJustCreated) {
                        // Budgets don't exist yet - Budget Service will create them
                        publishExpenseCreatedWithOldBudgetsEvent(
                                newExpenseId,
                                oldExpenseId,
                                expenseData.getBudgetIds(),
                                userId);
                    } else {
                        // Budgets already exist - notify Budget Service to replace old expense ID
                        publishExpenseCreatedWithExistingBudgetsEvent(
                                newExpenseId,
                                oldExpenseId,
                                expenseData.getBudgetIds(),
                                userId);
                    }
                }

            } catch (Exception e) {
                log.error("Error creating expense ID: {}", expenseData.getId(), e);
                results.add(BulkExpenseBudgetResponse.MappingResult.builder()
                        .oldExpenseId(expenseData.getId())
                        .success(false)
                        .errorMessage("Failed to create expense: " + e.getMessage())
                        .build());
            }
        }

        // Step 3: Create results for all expenses
        for (BulkExpenseBudgetRequest.ExpenseData expenseData : mapping.getExpenses()) {
            Long oldExpenseId = expenseData.getId();
            Long newExpenseId = oldToNewExpenseIds.get(oldExpenseId);

            // Create budget mappings for this expense
            List<BulkExpenseBudgetResponse.BudgetMapping> budgetMappings = new ArrayList<>();
            if (expenseData.getBudgetIds() != null) {
                for (Long oldBudgetId : expenseData.getBudgetIds()) {
                    budgetMappings.add(BulkExpenseBudgetResponse.BudgetMapping.builder()
                            .oldBudgetId(oldBudgetId)
                            .newBudgetId(oldToNewBudgetIds.get(oldBudgetId)) // Will be null until Kafka event updates
                                                                             // it
                            .success(true)
                            .build());
                }
            }

            results.add(BulkExpenseBudgetResponse.MappingResult.builder()
                    .oldExpenseId(oldExpenseId)
                    .newExpenseId(newExpenseId)
                    .budgetMappings(budgetMappings)
                    .success(newExpenseId != null)
                    .errorMessage(newExpenseId == null ? "Failed to create expense" : null)
                    .build());
        }
    }

    /**
     * HIGH-PERFORMANCE ASYNC PROCESSING
     * Process bulk expense and budget creation asynchronously with progress
     * tracking
     * Uses CompletableFuture and parallel streams for maximum throughput
     * 
     * @param request The bulk request containing expenses and budgets
     * @param userId  The user ID
     * @param jobId   The job ID for progress tracking
     */
    @Async
    public void processBulkExpensesAndBudgetsAsync(
            BulkExpenseBudgetRequest request,
            Integer userId,
            String jobId) {
        try {
            log.info("Starting async bulk processing for job: {} with user: {}", jobId, userId);

            // Calculate total items to process
            int totalExpenses = 0;
            int totalBudgets = 0;
            for (BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping : request.getMappings()) {
                totalExpenses += mapping.getExpenses() != null ? mapping.getExpenses().size() : 0;
                totalBudgets += mapping.getBudgets() != null ? mapping.getBudgets().size() : 0;
            }
            int totalItems = totalExpenses + totalBudgets;

            log.info("Processing {} expenses and {} budgets (total: {} items)",
                    totalExpenses, totalBudgets, totalItems);

            // Thread-safe counters for progress tracking
            AtomicInteger processedCount = new AtomicInteger(0);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger failureCount = new AtomicInteger(0);

            // Thread-safe maps for ID tracking
            ConcurrentHashMap<Long, Long> oldToNewExpenseIds = new ConcurrentHashMap<>();
            ConcurrentHashMap<Long, Long> oldToNewBudgetIds = new ConcurrentHashMap<>();

            // Process each mapping
            for (BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping : request.getMappings()) {

                // PHASE 1: Create budgets in parallel
                if (mapping.getBudgets() != null && !mapping.getBudgets().isEmpty()) {
                    processBudgetsInParallel(
                            mapping.getBudgets(),
                            userId,
                            jobId,
                            oldToNewBudgetIds,
                            oldToNewExpenseIds,
                            processedCount,
                            successCount,
                            failureCount);
                }

                // PHASE 2: Create expenses in parallel
                if (mapping.getExpenses() != null && !mapping.getExpenses().isEmpty()) {
                    processExpensesInParallel(
                            mapping.getExpenses(),
                            userId,
                            jobId,
                            oldToNewExpenseIds,
                            oldToNewBudgetIds,
                            processedCount,
                            successCount,
                            failureCount);
                }
            }

            // Mark as complete
            progressTracker.complete(jobId,
                    String.format("Completed: %d successful, %d failed out of %d items",
                            successCount.get(), failureCount.get(), totalItems));

            log.info("Async bulk processing completed for job: {} - Success: {}, Failed: {}",
                    jobId, successCount.get(), failureCount.get());

        } catch (Exception e) {
            log.error("Fatal error in async bulk processing for job: {}", jobId, e);
            progressTracker.fail(jobId, "Processing failed: " + e.getMessage());
        }
    }

    /**
     * Process budgets in parallel using CompletableFuture
     * Splits work across multiple threads for maximum CPU utilization
     */
    private void processBudgetsInParallel(
            List<BulkExpenseBudgetRequest.BudgetData> budgets,
            Integer userId,
            String jobId,
            ConcurrentHashMap<Long, Long> oldToNewBudgetIds,
            ConcurrentHashMap<Long, Long> oldToNewExpenseIds,
            AtomicInteger processedCount,
            AtomicInteger successCount,
            AtomicInteger failureCount) {
        log.info("Processing {} budgets in parallel", budgets.size());

        // Split budgets into batches for parallel processing
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < budgets.size(); i += BATCH_SIZE) {
            int endIndex = Math.min(i + BATCH_SIZE, budgets.size());
            List<BulkExpenseBudgetRequest.BudgetData> batch = budgets.subList(i, endIndex);

            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                processBudgetBatch(
                        batch,
                        userId,
                        jobId,
                        oldToNewBudgetIds,
                        oldToNewExpenseIds,
                        processedCount,
                        successCount,
                        failureCount);
            });

            futures.add(future);
        }

        // Wait for all batches to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        log.info("Completed processing {} budgets", budgets.size());
    }

    /**
     * Process a batch of budgets
     */
    private void processBudgetBatch(
            List<BulkExpenseBudgetRequest.BudgetData> batch,
            Integer userId,
            String jobId,
            ConcurrentHashMap<Long, Long> oldToNewBudgetIds,
            ConcurrentHashMap<Long, Long> oldToNewExpenseIds,
            AtomicInteger processedCount,
            AtomicInteger successCount,
            AtomicInteger failureCount) {
        for (BulkExpenseBudgetRequest.BudgetData budgetData : batch) {
            try {
                Long oldBudgetId = budgetData.getId();

                // Skip if already processed
                if (oldToNewBudgetIds.containsKey(oldBudgetId)) {
                    processedCount.incrementAndGet();
                    updateProgressIfNeeded(jobId, processedCount.get());
                    continue;
                }

                // Publish budget creation event
                publishBudgetCreationEvent(
                        budgetData,
                        null,
                        null,
                        userId,
                        new HashMap<>(oldToNewExpenseIds));

                // Mark as processed (-1L placeholder since ConcurrentHashMap doesn't allow null
                // values)
                oldToNewBudgetIds.put(oldBudgetId, -1L);
                successCount.incrementAndGet();

            } catch (Exception e) {
                log.error("Error processing budget ID: {}", budgetData.getId(), e);
                failureCount.incrementAndGet();
            } finally {
                int current = processedCount.incrementAndGet();
                updateProgressIfNeeded(jobId, current);
            }
        }
    }

    /**
     * Process expenses in parallel using CompletableFuture
     * Maximum parallelism for CPU-intensive operations
     */
    private void processExpensesInParallel(
            List<BulkExpenseBudgetRequest.ExpenseData> expenses,
            Integer userId,
            String jobId,
            ConcurrentHashMap<Long, Long> oldToNewExpenseIds,
            ConcurrentHashMap<Long, Long> oldToNewBudgetIds,
            AtomicInteger processedCount,
            AtomicInteger successCount,
            AtomicInteger failureCount) {
        log.info("Processing {} expenses in parallel", expenses.size());

        // Split expenses into batches
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < expenses.size(); i += BATCH_SIZE) {
            int endIndex = Math.min(i + BATCH_SIZE, expenses.size());
            List<BulkExpenseBudgetRequest.ExpenseData> batch = expenses.subList(i, endIndex);

            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                processExpenseBatch(
                        batch,
                        userId,
                        jobId,
                        oldToNewExpenseIds,
                        oldToNewBudgetIds,
                        processedCount,
                        successCount,
                        failureCount);
            });

            futures.add(future);
        }

        // Wait for all batches to complete
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        log.info("Completed processing {} expenses", expenses.size());
    }

    /**
     * Process a batch of expenses
     */
    private void processExpenseBatch(
            List<BulkExpenseBudgetRequest.ExpenseData> batch,
            Integer userId,
            String jobId,
            ConcurrentHashMap<Long, Long> oldToNewExpenseIds,
            ConcurrentHashMap<Long, Long> oldToNewBudgetIds,
            AtomicInteger processedCount,
            AtomicInteger successCount,
            AtomicInteger failureCount) {
        for (BulkExpenseBudgetRequest.ExpenseData expenseData : batch) {
            try {
                Long oldExpenseId = expenseData.getId();

                // Skip if already processed
                if (oldToNewExpenseIds.containsKey(oldExpenseId)) {
                    processedCount.incrementAndGet();
                    updateProgressIfNeeded(jobId, processedCount.get());
                    continue;
                }

                // Create expense (transactional per expense for isolation)
                Expense newExpense = createExpenseFromDataTransactional(expenseData, userId);
                Long newExpenseId = newExpense.getId().longValue();
                oldToNewExpenseIds.put(oldExpenseId, newExpenseId);

                // Publish linking events
                if (expenseData.getBudgetIds() != null && !expenseData.getBudgetIds().isEmpty()) {
                    boolean budgetsJustCreated = expenseData.getBudgetIds().stream()
                            .anyMatch(oldToNewBudgetIds::containsKey);

                    if (budgetsJustCreated) {
                        publishExpenseCreatedWithOldBudgetsEvent(
                                newExpenseId, oldExpenseId, expenseData.getBudgetIds(), userId);
                    } else {
                        publishExpenseCreatedWithExistingBudgetsEvent(
                                newExpenseId, oldExpenseId, expenseData.getBudgetIds(), userId);
                    }
                }

                successCount.incrementAndGet();

            } catch (Exception e) {
                log.error("Error processing expense ID: {}", expenseData.getId(), e);
                failureCount.incrementAndGet();
            } finally {
                int current = processedCount.incrementAndGet();
                updateProgressIfNeeded(jobId, current);
            }
        }
    }

    /**
     * Transactional wrapper for expense creation
     * Each expense creation is its own transaction for maximum parallelism
     */
    @Transactional
    public Expense createExpenseFromDataTransactional(
            BulkExpenseBudgetRequest.ExpenseData data,
            Integer userId) throws Exception {
        return createExpenseFromData(data, userId);
    }

    /**
     * Update progress tracker only at intervals to reduce overhead
     */
    private void updateProgressIfNeeded(String jobId, int currentCount) {
        if (currentCount % PROGRESS_UPDATE_INTERVAL == 0) {
            progressTracker.increment(jobId, PROGRESS_UPDATE_INTERVAL);
        }
    }

    /**
     * Create expense from request data
     */
    private Expense createExpenseFromData(BulkExpenseBudgetRequest.ExpenseData data, Integer userId) throws Exception {
        // Validate required fields
        if (data.getDate() == null || data.getDate().isEmpty()) {
            throw new IllegalArgumentException("Expense date is required");
        }
        if (data.getExpense() == null) {
            throw new IllegalArgumentException("Expense details are required");
        }
        if (data.getExpense().getExpenseName() == null || data.getExpense().getExpenseName().isEmpty()) {
            throw new IllegalArgumentException("Expense name is required");
        }
        if (data.getExpense().getAmount() == null) {
            throw new IllegalArgumentException("Expense amount is required");
        }

        Expense expense = new Expense();
        expense.setDate(LocalDate.parse(data.getDate()));
        expense.setCategoryId(data.getCategoryId() != null ? data.getCategoryId().intValue() : 0);
        expense.setCategoryName(data.getCategoryName() != null ? data.getCategoryName() : "");
        expense.setIncludeInBudget(data.getIncludeInBudget() != null ? data.getIncludeInBudget() : false);
        expense.setUserId(userId);
        expense.setBudgetIds(new HashSet<>()); // Will be populated later via events
        expense.setBill(data.getBill() != null ? data.getBill() : false);

        // Create expense details
        ExpenseDetails details = new ExpenseDetails();
        BulkExpenseBudgetRequest.ExpenseDetails expenseDetails = data.getExpense();
        details.setExpenseName(expenseDetails.getExpenseName());
        details.setAmount(expenseDetails.getAmount());
        details.setType(expenseDetails.getType() != null ? expenseDetails.getType() : "loss");
        details.setPaymentMethod(
                expenseDetails.getPaymentMethod() != null ? expenseDetails.getPaymentMethod() : "cash");
        details.setNetAmount(
                expenseDetails.getNetAmount() != null ? expenseDetails.getNetAmount() : -expenseDetails.getAmount());
        details.setComments(expenseDetails.getComments());
        details.setCreditDue(expenseDetails.getCreditDue() != null ? expenseDetails.getCreditDue() : 0.0);
        // Note: masked field not present in ExpenseDetails entity

        expense.setExpense(details);
        details.setExpense(expense);

        // Save the expense
        ExpenseDTO expenseDTO = convertToExpenseDTO(expense);
        ExpenseDTO savedDTO = expenseService.addExpense(expenseDTO, userId);

        log.info("Successfully created expense: {} with amount: {}", savedDTO.getId(), expenseDetails.getAmount());

        // Convert back to entity
        return expenseRepository.findById(savedDTO.getId()).orElseThrow(
                () -> new RuntimeException("Failed to retrieve saved expense"));
    }

    /**
     * Convert Expense entity to ExpenseDTO
     */
    private ExpenseDTO convertToExpenseDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setDate(expense.getDate() != null ? expense.getDate().toString() : null);
        dto.setCategoryId(expense.getCategoryId());
        dto.setCategoryName(expense.getCategoryName());
        dto.setIncludeInBudget(expense.isIncludeInBudget());
        dto.setUserId(expense.getUserId());
        dto.setBudgetIds(expense.getBudgetIds());
        dto.setBill(expense.isBill());

        if (expense.getExpense() != null) {
            ExpenseDetailsDTO detailsDTO = new ExpenseDetailsDTO();
            detailsDTO.setExpenseName(expense.getExpense().getExpenseName());
            detailsDTO.setAmount(expense.getExpense().getAmount());
            detailsDTO.setType(expense.getExpense().getType());
            detailsDTO.setPaymentMethod(expense.getExpense().getPaymentMethod());
            detailsDTO.setNetAmount(expense.getExpense().getNetAmount());
            detailsDTO.setComments(expense.getExpense().getComments());
            detailsDTO.setCreditDue(expense.getExpense().getCreditDue());
            // Note: masked field not present in ExpenseDetails entity
            detailsDTO.setMasked(false);
            dto.setExpense(detailsDTO);
        }

        return dto;
    }

    /**
     * Publish event for Budget Service to create budget
     */
    private void publishBudgetCreationEvent(
            BulkExpenseBudgetRequest.BudgetData budgetData,
            Long oldExpenseId,
            Long newExpenseId,
            Integer userId,
            Map<Long, Long> oldToNewExpenseIds) {
        // Convert old expense IDs to new expense IDs where available
        // IMPORTANT: Only include expenses that have been successfully mapped
        List<Long> mappedNewExpenseIds = new ArrayList<>();
        if (budgetData.getExpenseIds() != null && !budgetData.getExpenseIds().isEmpty()) {
            for (Long oldId : budgetData.getExpenseIds()) {
                Long newId = oldToNewExpenseIds.get(oldId);
                if (newId != null) {
                    mappedNewExpenseIds.add(newId);
                } else {
                    log.debug(
                            "Expense old ID {} not yet mapped, will be linked via EXPENSE_CREATED_WITH_OLD_BUDGETS event",
                            oldId);
                }
            }
        }

        // Create budget details
        ExpenseBudgetLinkingEvent.BudgetDetails budgetDetails = ExpenseBudgetLinkingEvent.BudgetDetails.builder()
                .name(budgetData.getName())
                .description(budgetData.getDescription())
                .amount(budgetData.getAmount())
                .startDate(budgetData.getStartDate())
                .endDate(budgetData.getEndDate())
                .includeInBudget(budgetData.getIncludeInBudget() != null ? budgetData.getIncludeInBudget() : false)
                .remainingAmount(budgetData.getRemainingAmount() != null ? budgetData.getRemainingAmount()
                        : budgetData.getAmount())
                .expenseIds(budgetData.getExpenseIds())
                .build();

        ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
                .eventType(ExpenseBudgetLinkingEvent.EventType.BUDGET_CREATED_WITH_OLD_EXPENSES)
                .userId(userId.longValue())
                .oldBudgetId(budgetData.getId())
                .oldExpenseId(oldExpenseId)
                .newExpenseId(newExpenseId)
                .oldBudgetIds(budgetData.getExpenseIds() != null ? budgetData.getExpenseIds() : new ArrayList<>())
                .newBudgetIds(mappedNewExpenseIds) // Only include successfully mapped expense IDs
                .budgetDetails(budgetDetails)
                .timestamp(LocalDateTime.now().toString())
                .build();

        try {
            publishAfterCommit(event);
            log.info(
                    "Published budget creation event for old budget ID: {} with {} mapped expense IDs (out of {} total)",
                    budgetData.getId(), mappedNewExpenseIds.size(),
                    budgetData.getExpenseIds() != null ? budgetData.getExpenseIds().size() : 0);
        } catch (Exception e) {
            log.error("Failed to publish budget creation event for budget ID: {}", budgetData.getId(), e);
            throw new RuntimeException("Failed to publish budget creation event", e);
        }
    }

    /**
     * Publish event when expense is created with old budget IDs
     */
    private void publishExpenseCreatedWithOldBudgetsEvent(
            Long newExpenseId,
            Long oldExpenseId,
            List<Long> oldBudgetIds,
            Integer userId) {
        ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
                .eventType(ExpenseBudgetLinkingEvent.EventType.EXPENSE_CREATED_WITH_OLD_BUDGETS)
                .userId(userId.longValue())
                .newExpenseId(newExpenseId)
                .oldExpenseId(oldExpenseId)
                .oldBudgetIds(oldBudgetIds)
                .timestamp(LocalDateTime.now().toString())
                .build();

        publishAfterCommit(event);
        log.info("Published expense created event with old budget IDs: {}", oldBudgetIds);
    }

    /**
     * Publish event when expense is created with existing budgets (replace old
     * expense ID with new)
     */
    private void publishExpenseCreatedWithExistingBudgetsEvent(
            Long newExpenseId,
            Long oldExpenseId,
            List<Long> oldBudgetIds,
            Integer userId) {
        ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
                .eventType(ExpenseBudgetLinkingEvent.EventType.EXPENSE_CREATED_WITH_EXISTING_BUDGETS)
                .userId(userId.longValue())
                .newExpenseId(newExpenseId)
                .oldExpenseId(oldExpenseId)
                .oldBudgetIds(oldBudgetIds)
                .timestamp(LocalDateTime.now().toString())
                .build();

        publishAfterCommit(event);
        log.info(
                "Published EXPENSE_CREATED_WITH_EXISTING_BUDGETS event for new expense {} (old: {}) with {} existing budgets",
                newExpenseId, oldExpenseId, oldBudgetIds.size());
    }

    /**
     * Update expense with new budget IDs (called from Kafka consumer)
     * Includes retry logic to handle transaction visibility issues
     * Note: With publishAfterCommit(), this should rarely need retries
     */
    @Transactional
    public void updateExpenseWithNewBudgetIds(Long expenseId, List<Long> newBudgetIds, Integer userId) {
        int maxRetries = 3;
        int retryDelayMs = 1000; // Increased from 500ms to 1000ms for transaction commit delays

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                Expense expense = expenseRepository.findById(expenseId.intValue())
                        .orElse(null);

                if (expense == null) {
                    if (attempt < maxRetries) {
                        log.warn("Expense {} not found, attempt {}/{}, retrying after {}ms...",
                                expenseId, attempt, maxRetries, retryDelayMs);
                        Thread.sleep(retryDelayMs);
                        continue;
                    } else {
                        log.error("Expense {} not found after {} attempts, skipping", expenseId, maxRetries);
                        return; // Skip instead of throwing - expense might not exist in this batch
                    }
                }

                if (!expense.getUserId().equals(userId)) {
                    log.warn("Unauthorized access attempt to expense: {} by user: {}", expenseId, userId);
                    return; // Skip unauthorized access
                }

                // Convert Long to Integer for budget IDs
                Set<Integer> budgetIdsSet = newBudgetIds.stream()
                        .map(Long::intValue)
                        .collect(Collectors.toSet());

                expense.getBudgetIds().addAll(budgetIdsSet);
                expenseRepository.save(expense);

                log.info("Updated expense {} with new budget IDs: {}", expenseId, newBudgetIds);
                return; // Success - exit retry loop

            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.error("Interrupted while waiting to retry expense update: {}", expenseId);
                return;
            } catch (Exception e) {
                if (attempt < maxRetries) {
                    log.warn("Error updating expense {} (attempt {}/{}): {}",
                            expenseId, attempt, maxRetries, e.getMessage());
                    try {
                        Thread.sleep(retryDelayMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                } else {
                    log.error("Failed to update expense {} with budget IDs after {} attempts",
                            expenseId, maxRetries, e);
                    // Don't throw - just log and continue to avoid blocking Kafka consumer
                }
            }
        }
    }

    /**
     * Publish event to update expense with new budget ID
     */
    public void publishExpenseBudgetLinkUpdate(Long expenseId, Long budgetId, Integer userId) {
        ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
                .eventType(ExpenseBudgetLinkingEvent.EventType.EXPENSE_BUDGET_LINK_UPDATE)
                .userId(userId.longValue())
                .newExpenseId(expenseId)
                .newBudgetId(budgetId)
                .timestamp(LocalDateTime.now().toString())
                .build();

        kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
        log.info("Published expense-budget link update event for expense: {}, budget: {}", expenseId, budgetId);
    }
}
                