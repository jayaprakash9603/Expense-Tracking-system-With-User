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

    private static final String EXPENSE_BUDGET_LINKING_TOPIC = "expense-BudgetModel-linking-events";
    private static final int BATCH_SIZE = 20;
    private static final int PROGRESS_UPDATE_INTERVAL = 10;

    private void publishAfterCommit(Object event) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
                }
            });
        } else {
            kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
        }
    }

    @Transactional
    public BulkExpenseBudgetResponse processBulkExpensesAndBudgets(BulkExpenseBudgetRequest request, Integer userId) {
        log.info("Processing bulk expense and BudgetModel request for UserDTO: {} with {} mappings", userId,
                request.getMappings() != null ? request.getMappings().size() : 0);

        if (request.getMappings() == null || request.getMappings().isEmpty()) {
            log.warn("Empty mappings received for UserDTO: {}", userId);
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

        for (BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping : request.getMappings()) {
            try {
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

                processMappingGroup(
                        mapping,
                        userId,
                        oldToNewExpenseIds,
                        oldToNewBudgetIds,
                        results);

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

        log.info("Completed bulk processing for UserDTO {}: {} total, {} successful, {} failed",
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

    private void processMappingGroup(
            BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping,
            Integer userId,
            Map<Long, Long> oldToNewExpenseIds,
            Map<Long, Long> oldToNewBudgetIds,
            List<BulkExpenseBudgetResponse.MappingResult> results) {
        log.info("Processing mapping group with {} expenses and {} budgets",
                mapping.getExpenses().size(),
                mapping.getBudgets() != null ? mapping.getBudgets().size() : 0);

        if (mapping.getBudgets() != null && !mapping.getBudgets().isEmpty()) {
            for (BulkExpenseBudgetRequest.BudgetData budgetData : mapping.getBudgets()) {
                try {
                    Long oldBudgetId = budgetData.getId();

                    if (oldToNewBudgetIds.containsKey(oldBudgetId)) {
                        log.info("BudgetModel {} already processed, skipping duplicate", oldBudgetId);
                        continue;
                    }

                    publishBudgetCreationEvent(
                            budgetData,
                            null,
                            null,
                            userId,
                            oldToNewExpenseIds);

                    oldToNewBudgetIds.put(oldBudgetId, null);

                    log.info("Published BudgetModel creation event for old BudgetModel ID: {}", oldBudgetId);

                } catch (Exception e) {
                    log.error("Error processing BudgetModel ID: {}", budgetData.getId(), e);
                }
            }
        }

        for (BulkExpenseBudgetRequest.ExpenseData expenseData : mapping.getExpenses()) {
            try {
                Long oldExpenseId = expenseData.getId();

                if (oldToNewExpenseIds.containsKey(oldExpenseId)) {
                    log.info("Expense {} already created, skipping duplicate", oldExpenseId);
                    continue;
                }

                Expense newExpense = createExpenseFromData(expenseData, userId);
                Long newExpenseId = newExpense.getId().longValue();
                oldToNewExpenseIds.put(oldExpenseId, newExpenseId);

                log.info("Created expense: old ID {} -> new ID {}", oldExpenseId, newExpenseId);

                if (expenseData.getBudgetIds() != null && !expenseData.getBudgetIds().isEmpty()) {
                    boolean budgetsJustCreated = expenseData.getBudgetIds().stream()
                            .anyMatch(oldToNewBudgetIds::containsKey);

                    if (budgetsJustCreated) {
                        publishExpenseCreatedWithOldBudgetsEvent(
                                newExpenseId,
                                oldExpenseId,
                                expenseData.getBudgetIds(),
                                userId);
                    } else {
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

        for (BulkExpenseBudgetRequest.ExpenseData expenseData : mapping.getExpenses()) {
            Long oldExpenseId = expenseData.getId();
            Long newExpenseId = oldToNewExpenseIds.get(oldExpenseId);

            List<BulkExpenseBudgetResponse.BudgetMapping> budgetMappings = new ArrayList<>();
            if (expenseData.getBudgetIds() != null) {
                for (Long oldBudgetId : expenseData.getBudgetIds()) {
                    budgetMappings.add(BulkExpenseBudgetResponse.BudgetMapping.builder()
                            .oldBudgetId(oldBudgetId)
                            .newBudgetId(oldToNewBudgetIds.get(oldBudgetId))
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

    @Async
    public void processBulkExpensesAndBudgetsAsync(
            BulkExpenseBudgetRequest request,
            Integer userId,
            String jobId) {
        try {
            log.info("Starting async bulk processing for job: {} with UserDTO: {}", jobId, userId);

            int totalExpenses = 0;
            int totalBudgets = 0;
            for (BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping : request.getMappings()) {
                totalExpenses += mapping.getExpenses() != null ? mapping.getExpenses().size() : 0;
                totalBudgets += mapping.getBudgets() != null ? mapping.getBudgets().size() : 0;
            }
            int totalItems = totalExpenses + totalBudgets;

            log.info("Processing {} expenses and {} budgets (total: {} items)",
                    totalExpenses, totalBudgets, totalItems);

            AtomicInteger processedCount = new AtomicInteger(0);
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger failureCount = new AtomicInteger(0);

            ConcurrentHashMap<Long, Long> oldToNewExpenseIds = new ConcurrentHashMap<>();
            ConcurrentHashMap<Long, Long> oldToNewBudgetIds = new ConcurrentHashMap<>();

            for (BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping : request.getMappings()) {

                if (mapping.getBudgets() != null && !mapping.getBudgets().isEmpty()) {
                    progressTracker.updateStage(jobId, "Creating Budgets");
                    int totalBatchesForBudgets = (int) Math.ceil(mapping.getBudgets().size() / (double) BATCH_SIZE);
                    progressTracker.updateBatch(jobId, 0, totalBatchesForBudgets);

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

                if (mapping.getExpenses() != null && !mapping.getExpenses().isEmpty()) {
                    progressTracker.updateStage(jobId, "Creating Expenses");
                    int totalBatchesForExpenses = (int) Math.ceil(mapping.getExpenses().size() / (double) BATCH_SIZE);
                    progressTracker.updateBatch(jobId, 0, totalBatchesForExpenses);

                    processExpensesInParallel(
                            mapping.getExpenses(),
                            userId,
                            jobId,
                            oldToNewExpenseIds,
                            oldToNewBudgetIds,
                            processedCount,
                            successCount,
                            failureCount);

                    progressTracker.updateStage(jobId, "Linking Budgets & Expenses");
                }
            }

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

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        log.info("Completed processing {} budgets", budgets.size());
    }

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

                if (oldToNewBudgetIds.containsKey(oldBudgetId)) {
                    processedCount.incrementAndGet();
                    updateProgressIfNeeded(jobId, processedCount.get());
                    continue;
                }

                publishBudgetCreationEvent(
                        budgetData,
                        null,
                        null,
                        userId,
                        new HashMap<>(oldToNewExpenseIds));

                oldToNewBudgetIds.put(oldBudgetId, -1L);
                successCount.incrementAndGet();

                progressTracker.addRecentItem(jobId,
                        String.format("BudgetModel: %s (%.0f)", budgetData.getName(), budgetData.getAmount()));

            } catch (Exception e) {
                log.error("Error processing BudgetModel ID: {}", budgetData.getId(), e);
                failureCount.incrementAndGet();
            } finally {
                int current = processedCount.incrementAndGet();
                updateProgressIfNeeded(jobId, current);
            }
        }
    }

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

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        log.info("Completed processing {} expenses", expenses.size());
    }

    @Transactional
    private void processExpenseBatch(
            List<BulkExpenseBudgetRequest.ExpenseData> batch,
            Integer userId,
            String jobId,
            ConcurrentHashMap<Long, Long> oldToNewExpenseIds,
            ConcurrentHashMap<Long, Long> oldToNewBudgetIds,
            AtomicInteger processedCount,
            AtomicInteger successCount,
            AtomicInteger failureCount) {

        List<Expense> expensesToSave = new ArrayList<>();
        List<BulkExpenseBudgetRequest.ExpenseData> validExpenseData = new ArrayList<>();

        for (BulkExpenseBudgetRequest.ExpenseData expenseData : batch) {
            try {
                Long oldExpenseId = expenseData.getId();

                if (oldToNewExpenseIds.containsKey(oldExpenseId)) {
                    processedCount.incrementAndGet();
                    continue;
                }

                Expense newExpense = createExpenseFromData(expenseData, userId);
                expensesToSave.add(newExpense);
                validExpenseData.add(expenseData);

            } catch (Exception e) {
                log.error("Error preparing expense ID: {}", expenseData.getId(), e);
                failureCount.incrementAndGet();
                processedCount.incrementAndGet();
            }
        }

        if (!expensesToSave.isEmpty()) {
            List<Expense> savedExpenses = expenseRepository.saveAll(expensesToSave);

            for (int i = 0; i < savedExpenses.size(); i++) {
                Expense savedExpense = savedExpenses.get(i);
                BulkExpenseBudgetRequest.ExpenseData expenseData = validExpenseData.get(i);
                Long oldExpenseId = expenseData.getId();
                Long newExpenseId = savedExpense.getId().longValue();

                oldToNewExpenseIds.put(oldExpenseId, newExpenseId);

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

                if (i % 3 == 0) {
                    progressTracker.addRecentItem(jobId,
                            String.format("Expense: %s (%.0f)",
                                    expenseData.getExpense().getExpenseName(),
                                    expenseData.getExpense().getAmount()));
                }
            }
        }

        int current = processedCount.addAndGet(batch.size());
        updateProgressIfNeeded(jobId, current);

        int budgetCount = oldToNewBudgetIds.size();
        int expenseCount = oldToNewExpenseIds.size();
        progressTracker.updateCounts(jobId, budgetCount, expenseCount,
                successCount.get(), failureCount.get());
    }

    @Transactional
    public Expense createExpenseFromDataTransactional(
            BulkExpenseBudgetRequest.ExpenseData data,
            Integer userId) throws Exception {
        return createExpenseFromData(data, userId);
    }

    private void updateProgressIfNeeded(String jobId, int currentCount) {
        if (currentCount % PROGRESS_UPDATE_INTERVAL == 0) {
            progressTracker.increment(jobId, PROGRESS_UPDATE_INTERVAL);
        }
    }

    private Expense createExpenseFromData(BulkExpenseBudgetRequest.ExpenseData data, Integer userId) throws Exception {
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
        expense.setBudgetIds(new HashSet<>());
        expense.setBill(data.getBill() != null ? data.getBill() : false);

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

        expense.setExpense(details);
        details.setExpense(expense);

        ExpenseDTO expenseDTO = convertToExpenseDTO(expense);
        ExpenseDTO savedDTO = expenseService.addExpense(expenseDTO, userId);

        log.info("Successfully created expense: {} with amount: {}", savedDTO.getId(), expenseDetails.getAmount());

        return expenseRepository.findById(savedDTO.getId()).orElseThrow(
                () -> new RuntimeException("Failed to retrieve saved expense"));
    }

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
            detailsDTO.setMasked(false);
            dto.setExpense(detailsDTO);
        }

        return dto;
    }

    private void publishBudgetCreationEvent(
            BulkExpenseBudgetRequest.BudgetData budgetData,
            Long oldExpenseId,
            Long newExpenseId,
            Integer userId,
            Map<Long, Long> oldToNewExpenseIds) {
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
                .newBudgetIds(mappedNewExpenseIds)
                .budgetDetails(budgetDetails)
                .timestamp(LocalDateTime.now().toString())
                .build();

        try {
            publishAfterCommit(event);
            log.info(
                    "Published BudgetModel creation event for old BudgetModel ID: {} with {} mapped expense IDs (out of {} total)",
                    budgetData.getId(), mappedNewExpenseIds.size(),
                    budgetData.getExpenseIds() != null ? budgetData.getExpenseIds().size() : 0);
        } catch (Exception e) {
            log.error("Failed to publish BudgetModel creation event for BudgetModel ID: {}", budgetData.getId(), e);
            throw new RuntimeException("Failed to publish BudgetModel creation event", e);
        }
    }

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
        log.info("Published expense created event with old BudgetModel IDs: {}", oldBudgetIds);
    }

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

    @Transactional
    public void updateExpenseWithNewBudgetIds(Long expenseId, List<Long> newBudgetIds, Integer userId) {
        int maxRetries = 3;
        int retryDelayMs = 1000;

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
                        return;
                    }
                }

                if (!expense.getUserId().equals(userId)) {
                    log.warn("Unauthorized access attempt to expense: {} by UserDTO: {}", expenseId, userId);
                    return;
                }

                Set<Integer> budgetIdsSet = newBudgetIds.stream()
                        .map(Long::intValue)
                        .collect(Collectors.toSet());

                expense.getBudgetIds().addAll(budgetIdsSet);
                expenseRepository.save(expense);

                log.info("Updated expense {} with new BudgetModel IDs: {}", expenseId, newBudgetIds);
                return;

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
                    log.error("Failed to update expense {} with BudgetModel IDs after {} attempts",
                            expenseId, maxRetries, e);
                }
            }
        }
    }

    public void publishExpenseBudgetLinkUpdate(Long expenseId, Long budgetId, Integer userId) {
        ExpenseBudgetLinkingEvent event = ExpenseBudgetLinkingEvent.builder()
                .eventType(ExpenseBudgetLinkingEvent.EventType.EXPENSE_BUDGET_LINK_UPDATE)
                .userId(userId.longValue())
                .newExpenseId(expenseId)
                .newBudgetId(budgetId)
                .timestamp(LocalDateTime.now().toString())
                .build();

        kafkaTemplate.send(EXPENSE_BUDGET_LINKING_TOPIC, event);
        log.info("Published expense-BudgetModel link update event for expense: {}, BudgetModel: {}", expenseId, budgetId);
    }

    public void removeBudgetIdsFromExpense(Long expenseId, List<Long> budgetIdsToRemove, Integer userId) {
        int maxRetries = 3;
        int retryDelayMs = 1000;

        log.info(">>> Starting removeBudgetIdsFromExpense for expenseId={}, budgetsToRemove={}, userId={}",
                expenseId, budgetIdsToRemove, userId);

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.info(">>> Removing BudgetModel IDs from expense {} (attempt {}/{})",
                        expenseId, attempt, maxRetries);

                Expense expense = expenseRepository.findById(expenseId.intValue())
                        .orElseThrow(() -> new UserException("Expense not found: " + expenseId));

                log.info(">>> Found expense {}. Current budgetIds: {}", expenseId, expense.getBudgetIds());

                if (expense.getBudgetIds() == null || expense.getBudgetIds().isEmpty()) {
                    log.info(">>> Expense {} has no BudgetModel IDs, nothing to remove", expenseId);
                    return;
                }

                Set<Integer> budgetIdsSetToRemove = budgetIdsToRemove.stream()
                        .map(Long::intValue)
                        .collect(Collectors.toSet());

                log.info(">>> BudgetModel IDs to remove (as Integer): {}", budgetIdsSetToRemove);

                int initialSize = expense.getBudgetIds().size();
                boolean removed = expense.getBudgetIds().removeAll(budgetIdsSetToRemove);
                int removedCount = initialSize - expense.getBudgetIds().size();

                log.info(">>> Removal result - removed={}, removedCount={}, remainingBudgetIds={}",
                        removed, removedCount, expense.getBudgetIds());

                Expense savedExpense = expenseRepository.save(expense);
                log.info(">>> Saved expense {}. Final budgetIds: {}",
                        savedExpense.getId(), savedExpense.getBudgetIds());

                log.info(">>> Successfully removed {} BudgetModel IDs from expense {}. Remaining budgets: {}",
                        removedCount, expenseId, expense.getBudgetIds().size());
                return;

            } catch (Exception e) {
                log.error(">>> Error removing budgets from expense {} (attempt {}/{}): {}",
                        expenseId, attempt, maxRetries, e.getMessage(), e);

                if (attempt < maxRetries) {
                    try {
                        log.info(">>> Retrying in {} ms...", retryDelayMs);
                        Thread.sleep(retryDelayMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error(">>> Interrupted while waiting to retry expense update: {}", expenseId);
                        return;
                    }
                } else {
                    log.error(">>> Failed to remove BudgetModel IDs from expense {} after {} attempts. Giving up.",
                            expenseId, maxRetries);
                }
            }
        }
    }
}
