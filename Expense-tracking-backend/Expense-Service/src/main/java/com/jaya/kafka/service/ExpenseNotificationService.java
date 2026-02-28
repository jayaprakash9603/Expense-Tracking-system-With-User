package com.jaya.kafka.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.ExpenseNotificationEvent;
import com.jaya.kafka.producer.ExpenseNotificationProducer;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;






@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseNotificationService {

    private final ExpenseNotificationProducer expenseNotificationProducer;
    private final ObjectMapper objectMapper;

    


    public void sendExpenseCreatedNotification(Expense expense) {
        try {
            ExpenseNotificationEvent event = buildExpenseEvent(
                    expense,
                    ExpenseNotificationEvent.Action.CREATE);

            expenseNotificationProducer.sendEvent(event);
            log.info("Sent expense created notification for expenseId: {}, userId: {}",
                    expense.getId(), expense.getUserId());
        } catch (Exception e) {
            log.error("Failed to send expense created notification for expenseId: {}",
                    expense.getId(), e);
            
        }
    }

    


    public void sendExpenseUpdatedNotification(Expense expense) {
        try {
            ExpenseNotificationEvent event = buildExpenseEvent(
                    expense,
                    ExpenseNotificationEvent.Action.UPDATE);

            expenseNotificationProducer.sendEvent(event);
            log.info("Sent expense updated notification for expenseId: {}, userId: {}",
                    expense.getId(), expense.getUserId());
        } catch (Exception e) {
            log.error("Failed to send expense updated notification for expenseId: {}",
                    expense.getId(), e);
        }
    }

    


    public void sendExpenseDeletedNotification(Integer expenseId, Integer userId, String description) {
        try {
            ExpenseNotificationEvent event = ExpenseNotificationEvent.builder()
                    .expenseId(expenseId)
                    .userId(userId)
                    .action(ExpenseNotificationEvent.Action.DELETE)
                    .description(description)
                    .timestamp(LocalDateTime.now())
                    .build();

            expenseNotificationProducer.sendEvent(event);
            log.info("Sent expense deleted notification for expenseId: {}, userId: {}",
                    expenseId, userId);
        } catch (Exception e) {
            log.error("Failed to send expense deleted notification for expenseId: {}",
                    expenseId, e);
        }
    }

    


    public void sendExpenseApprovedNotification(Expense expense) {
        try {
            ExpenseNotificationEvent event = buildExpenseEvent(
                    expense,
                    ExpenseNotificationEvent.Action.APPROVE);

            expenseNotificationProducer.sendEvent(event);
            log.info("Sent expense approved notification for expenseId: {}, userId: {}",
                    expense.getId(), expense.getUserId());
        } catch (Exception e) {
            log.error("Failed to send expense approved notification for expenseId: {}",
                    expense.getId(), e);
        }
    }

    


    public void sendExpenseRejectedNotification(Expense expense) {
        try {
            ExpenseNotificationEvent event = buildExpenseEvent(
                    expense,
                    ExpenseNotificationEvent.Action.REJECT);

            expenseNotificationProducer.sendEvent(event);
            log.info("Sent expense rejected notification for expenseId: {}, userId: {}",
                    expense.getId(), expense.getUserId());
        } catch (Exception e) {
            log.error("Failed to send expense rejected notification for expenseId: {}",
                    expense.getId(), e);
        }
    }

    


    private ExpenseNotificationEvent buildExpenseEvent(Expense expense, String action) {
        ExpenseNotificationEvent.ExpenseNotificationEventBuilder builder = ExpenseNotificationEvent.builder()
                .expenseId(expense.getId())
                .userId(expense.getUserId())
                .action(action)
                .timestamp(LocalDateTime.now());

        
        if (expense.getExpense() != null) {
            ExpenseDetails details = expense.getExpense();
            builder.amount(details.getAmount());
            builder.description(details.getExpenseName());
            builder.paymentMethod(details.getPaymentMethod());
        }

        
        if (expense.getCategoryName() != null && !expense.getCategoryName().isEmpty()) {
            builder.category(expense.getCategoryName());
        }

        
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("expenseDate", expense.getDate());
            metadata.put("categoryId", expense.getCategoryId());
            metadata.put("includeInBudget", expense.isIncludeInBudget());
            metadata.put("isBill", expense.isBill());

            if (expense.getExpense() != null) {
                metadata.put("type", expense.getExpense().getType());
                metadata.put("comments", expense.getExpense().getComments());
                metadata.put("netAmount", expense.getExpense().getNetAmount());
                metadata.put("creditDue", expense.getExpense().getCreditDue());
            }

            String metadataJson = objectMapper.writeValueAsString(metadata);
            builder.metadata(metadataJson);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize metadata for expense {}: {}", expense.getId(), e.getMessage());
        }

        return builder.build();
    }
}


