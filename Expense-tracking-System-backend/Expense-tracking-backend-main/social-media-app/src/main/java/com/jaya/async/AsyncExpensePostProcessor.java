// Java
package com.jaya.async;

import com.jaya.dto.User;
import com.jaya.events.BudgetExpenseEvent;
import com.jaya.events.CategoryExpenseEvent;
import com.jaya.dto.PaymentMethodEvent;
import com.jaya.kafka.BudgetExpenseKafkaProducerService;
import com.jaya.kafka.CategoryExpenseKafkaProducerService;
import com.jaya.kafka.PaymentMethodKafkaProducerService;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Component
public class AsyncExpensePostProcessor {

    private static final Logger logger = LoggerFactory.getLogger(AsyncExpensePostProcessor.class);
    private static final String CASH = "cash";

    private final PaymentMethodKafkaProducerService paymentMethodKafkaProducer;
    private final CategoryExpenseKafkaProducerService categoryExpenseKafkaProducer;
    private final BudgetExpenseKafkaProducerService budgetExpenseKafkaProducerService;
    private final CacheManager cacheManager;
    private final AsyncTaskExecutor expensePostExecutor;

    public AsyncExpensePostProcessor(PaymentMethodKafkaProducerService paymentMethodKafkaProducer,
                                     CategoryExpenseKafkaProducerService categoryExpenseKafkaProducer,
                                     BudgetExpenseKafkaProducerService budgetExpenseKafkaProducerService,
                                     CacheManager cacheManager,
                                     @Qualifier("expensePostExecutor") AsyncTaskExecutor expensePostExecutor) {
        this.paymentMethodKafkaProducer = paymentMethodKafkaProducer;
        this.categoryExpenseKafkaProducer = categoryExpenseKafkaProducer;
        this.budgetExpenseKafkaProducerService = budgetExpenseKafkaProducerService;
        this.cacheManager = cacheManager;
        this.expensePostExecutor = expensePostExecutor;
    }

    @Async("expensePostExecutor")
    public void publishEvent(List<Expense> savedExpenses, Integer userId, User user) {
        if (savedExpenses == null || savedExpenses.isEmpty()) return;
        try {
            List<CompletableFuture<Void>> futures = savedExpenses.stream()
                    .map(e -> CompletableFuture.runAsync(
                            () -> processSingleExpense(e, userId, user),
                            expensePostExecutor))
                    .toList();
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            updateExpenseCache(savedExpenses, userId);
            logger.info("Async post-processing completed for {} expenses (user {})", savedExpenses.size(), userId);
        } catch (Exception ex) {
            logger.error("Async parallel post-processing failed: {}", ex.getMessage(), ex);
        }
    }

    private void processSingleExpense(Expense e, Integer userId, User user) {
        try {
            handlePaymentMethod(e, user);
            updateCategoryExpenseIds(e, userId);
            updateBudgetExpenseLinks(e, e.getBudgetIds(), user);
        } catch (Exception ex) {
            logger.error("Failed processing expense {}: {}", e.getId(), ex.getMessage(), ex);
        }
    }

    private void handlePaymentMethod(Expense savedExpense, User user) {
        ExpenseDetails details = savedExpense.getExpense();
        if (details == null || details.getPaymentMethod() == null) return;
        String paymentMethodName = details.getPaymentMethod().trim();
        if (paymentMethodName.isEmpty()) return;
        String paymentType = details.getType().equalsIgnoreCase("loss") ? "expense" : "income";
        PaymentMethodEvent event = new PaymentMethodEvent(
                user.getId(),
                savedExpense.getId(),
                paymentMethodName,
                paymentType,
                "Automatically created for expense: " + paymentMethodName,
                CASH,
                getThemeAppropriateColor("salary"),
                "CREATE"
        );
        paymentMethodKafkaProducer.sendPaymentMethodEvent(event);
    }

    private void updateCategoryExpenseIds(Expense savedExpense, Integer userId) {
        if (savedExpense.getCategoryId() == null) return;
        CategoryExpenseEvent event = new CategoryExpenseEvent(
                userId,
                savedExpense.getId(),
                savedExpense.getCategoryId(),
                savedExpense.getCategoryName(),
                "ADD"
        );
        categoryExpenseKafkaProducer.sendCategoryExpenseEvent(event);
    }

    private void updateBudgetExpenseLinks(Expense savedExpense, Set<Integer> validBudgetIds, User user) {
        if (validBudgetIds == null || validBudgetIds.isEmpty()) return;
        BudgetExpenseEvent event = new BudgetExpenseEvent(
                user.getId(),
                savedExpense.getId(),
                validBudgetIds,
                "ADD"
        );
        budgetExpenseKafkaProducerService.sendBudgetExpenseEvent(event);
    }

    private void updateExpenseCache(List<Expense> savedExpenses, Integer userId) {
        Cache cache = cacheManager.getCache("expenses");
        if (cache == null) return;
        synchronized (("expenses-" + userId).intern()) {
            List<Expense> cached = cache.get(userId, List.class);
            if (cached == null) cached = new ArrayList<>();
            cached.addAll(savedExpenses);
            cache.put(userId, cached);
        }
    }

    private String getThemeAppropriateColor(String categoryName) {
        Map<String, String> colorMap = new HashMap<>();
        colorMap.put("salary", "#69f0ae");
        colorMap.put("expense", "#ff5252");
        int hash = categoryName.toLowerCase().hashCode();
        List<String> colors = new ArrayList<>(colorMap.values());
        return colors.get(Math.abs(hash % colors.size()));
    }


    @Async("expensePostExecutor")
    public void publishDeletionEvents(List<Expense> deletedExpenses, Integer userId) {
        if (deletedExpenses == null || deletedExpenses.isEmpty()) {
            return;
        }

        try {
            List<CompletableFuture<Void>> futures = deletedExpenses.stream()
                    .map(expense -> CompletableFuture.runAsync(
                            () -> processSingleExpenseDeletion(expense, userId),
                            expensePostExecutor))
                       .toList();

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            logger.info("Async deletion event processing completed for {} expenses (user {})",
                    deletedExpenses.size(), userId);
        } catch (Exception ex) {
            logger.error("Async deletion event processing failed: {}", ex.getMessage(), ex);
        }
    }

    private void processSingleExpenseDeletion(Expense expense, Integer userId) {
        try {
            // Publish budget expense deletion event
            publishBudgetExpenseDeletionEvent(expense, userId);

            // Publish category expense deletion event
            publishCategoryExpenseDeletionEvent(expense, userId);

            // Publish payment method expense deletion event
            publishPaymentMethodExpenseDeletionEvent(expense, userId);

            logger.debug("Deletion events published for expense ID: {}", expense.getId());
        } catch (Exception e) {
            logger.error("Failed to publish deletion events for expense ID: {} - {}",
                    expense.getId(), e.getMessage(), e);
        }
    }

    private void publishBudgetExpenseDeletionEvent(Expense expense, Integer userId) {
        Set<Integer> budgetIds = expense.getBudgetIds();
        if (budgetIds != null && !budgetIds.isEmpty()) {
            try {
                BudgetExpenseEvent budgetEvent = new BudgetExpenseEvent(
                        userId,
                        expense.getId(),
                        budgetIds,
                        "REMOVE"
                );
                budgetExpenseKafkaProducerService.sendBudgetExpenseEvent(budgetEvent);
                logger.debug("Budget expense deletion event sent for expense ID: {} with budget IDs: {}",
                        expense.getId(), budgetIds);
            } catch (Exception e) {
                logger.error("Failed to send budget expense deletion event for expense ID: {} - {}",
                        expense.getId(), e.getMessage());
            }
        }
    }

    private void publishCategoryExpenseDeletionEvent(Expense expense, Integer userId) {
        Integer categoryId = expense.getCategoryId();
        if (categoryId != null) {
            try {
                CategoryExpenseEvent categoryEvent = new CategoryExpenseEvent(
                        userId,
                        expense.getId(),
                        categoryId,
                        expense.getCategoryName(),
                        "REMOVE"
                );
                categoryExpenseKafkaProducer.sendCategoryExpenseEvent(categoryEvent);
                logger.debug("Category expense deletion event sent for expense ID: {} with category ID: {}",
                        expense.getId(), categoryId);
            } catch (Exception e) {
                logger.error("Failed to send category expense deletion event for expense ID: {} - {}",
                        expense.getId(), e.getMessage());
            }
        }
    }

    private void publishPaymentMethodExpenseDeletionEvent(Expense expense, Integer userId) {
        ExpenseDetails details = expense.getExpense();
        if (details != null && details.getPaymentMethod() != null && !details.getPaymentMethod().trim().isEmpty()) {
            try {
                String paymentMethodName = details.getPaymentMethod().trim();
                String paymentType = (details.getType() != null && details.getType().equalsIgnoreCase("loss")) ? "expense" : "income";

                PaymentMethodEvent paymentEvent = new PaymentMethodEvent(
                        userId,
                        expense.getId(),
                        paymentMethodName,
                        paymentType,
                        "Expense deletion",
                        CASH,
                        getThemeAppropriateColor(paymentMethodName),
                        "REMOVE"
                );
                paymentMethodKafkaProducer.sendPaymentMethodEvent(paymentEvent);
                logger.debug("Payment method expense deletion event sent for expense ID: {} with payment method: {}",
                        expense.getId(), paymentMethodName);
            } catch (Exception e) {
                logger.error("Failed to send payment method expense deletion event for expense ID: {} - {}",
                        expense.getId(), e.getMessage());
            }
        }
    }
}