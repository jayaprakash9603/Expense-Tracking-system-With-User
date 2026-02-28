package com.jaya.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.ExpenseDTO;
import com.jaya.common.dto.UserDTO;
import com.jaya.kafka.events.UnifiedActivityEvent;
import com.jaya.kafka.events.UnifiedActivityEvent.UserInfo;
import com.jaya.kafka.producer.UnifiedActivityEventProducer;
import com.jaya.models.Expense;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;











@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityService {

    private final UnifiedActivityEventProducer eventProducer;
    private final ObjectMapper objectMapper;

    
    
    

    


    @Async("friendActivityExecutor")
    public void sendExpenseCreatedEvent(ExpenseDTO expense, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);
            String expenseName = getExpenseDTOName(expense);
            Double amount = getExpenseDTOAmount(expense);

            String description = isOwnAction
                    ? String.format("Expense '%s' created for $%.2f", expenseName, amount != null ? amount : 0.0)
                    : String.format("%s created expense '%s' with amount $%.2f", actorName, expenseName,
                            amount != null ? amount : 0.0);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId() != null ? expense.getId().longValue() : null)
                    .entityName(expenseName)
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .amount(amount)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorEmail(actorUser.getEmail())
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.EXPENSE_SERVICE)
                    .newValues(buildExpenseDTOPayload(expense))
                    .entityPayload(buildExpenseDTOPayload(expense))
                    .metadata(buildExpenseDTOMetadata(expense))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Expense CREATED - expenseId={}, actorId={}, targetId={}, isOwnAction={}",
                    expense.getId(), actorUser.getId(), targetUser.getId(), isOwnAction);

        } catch (Exception e) {
            log.error("Failed to send expense created event: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendExpenseCreatedEvent(Expense expense, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);
            String expenseName = getExpenseName(expense);
            Double amount = getExpenseAmount(expense);

            String description = isOwnAction
                    ? String.format("Expense '%s' created for $%.2f", expenseName, amount)
                    : String.format("%s created expense '%s' with amount $%.2f", actorName, expenseName, amount);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId() != null ? expense.getId().longValue() : null)
                    .entityName(expenseName)
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .amount(amount)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorEmail(actorUser.getEmail())
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.EXPENSE_SERVICE)
                    .newValues(buildExpensePayload(expense))
                    .entityPayload(buildExpensePayload(expense))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Expense CREATED - expenseId={}, actorId={}, targetId={}",
                    expense.getId(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send expense created event: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendBulkExpensesCreatedEvent(List<Expense> expenses, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);
            double totalAmount = expenses.stream()
                    .mapToDouble(e -> e.getExpense() != null ? e.getExpense().getAmount() : 0.0)
                    .sum();

            String description = isOwnAction
                    ? String.format("Created %d expenses with total amount $%.2f", expenses.size(), totalAmount)
                    : String.format("%s created %d expenses with total amount $%.2f", actorName, expenses.size(),
                            totalAmount);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
                    .entityName("Bulk Expenses")
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .amount(totalAmount)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.EXPENSE_SERVICE)
                    .metadata(String.format("{\"count\": %d, \"totalAmount\": %.2f}", expenses.size(), totalAmount))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Bulk Expenses CREATED - count={}, actorId={}, targetId={}",
                    expenses.size(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send bulk expenses created event: {}", e.getMessage(), e);
        }
    }

    
    
    

    


    @Async("friendActivityExecutor")
    public void sendExpenseUpdatedEvent(Expense expense, Expense oldExpense, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);
            String expenseName = getExpenseName(expense);

            String description = isOwnAction
                    ? String.format("Expense '%s' updated", expenseName)
                    : String.format("%s updated expense '%s'", actorName, expenseName);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId() != null ? expense.getId().longValue() : null)
                    .entityName(expenseName)
                    .action(UnifiedActivityEvent.Action.UPDATE)
                    .description(description)
                    .amount(getExpenseAmount(expense))
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.EXPENSE_SERVICE)
                    .oldValues(oldExpense != null ? buildExpensePayload(oldExpense) : null)
                    .newValues(buildExpensePayload(expense))
                    .entityPayload(buildExpensePayload(expense))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Expense UPDATED - expenseId={}, actorId={}, targetId={}",
                    expense.getId(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send expense updated event: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendBulkExpensesUpdatedEvent(List<Expense> expenses, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Updated %d expenses", expenses.size())
                    : String.format("%s updated %d expenses", actorName, expenses.size());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
                    .entityName("Bulk Expenses")
                    .action(UnifiedActivityEvent.Action.UPDATE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.EXPENSE_SERVICE)
                    .metadata(String.format("{\"count\": %d}", expenses.size()))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Bulk Expenses UPDATED - count={}, actorId={}, targetId={}",
                    expenses.size(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send bulk expenses updated event: {}", e.getMessage(), e);
        }
    }

    
    
    

    


    @Async("friendActivityExecutor")
    public void sendExpenseDeletedEvent(Integer expenseId, String expenseName, Double amount, UserDTO actorUser,
            UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Expense '%s' deleted", expenseName)
                    : String.format("%s deleted expense '%s'", actorName, expenseName);

            Map<String, Object> oldValues = new HashMap<>();
            oldValues.put("id", expenseId);
            oldValues.put("name", expenseName);
            if (amount != null)
                oldValues.put("amount", amount);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
                    .entityId(expenseId.longValue())
                    .entityName(expenseName)
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .amount(amount)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.EXPENSE_SERVICE)
                    .oldValues(oldValues)
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Expense DELETED - expenseId={}, actorId={}, targetId={}",
                    expenseId, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send expense deleted event: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendBulkExpensesDeletedEvent(int count, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Deleted %d expenses", count)
                    : String.format("%s deleted %d expenses", actorName, count);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
                    .entityName("Bulk Expenses")
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.EXPENSE_SERVICE)
                    .metadata(String.format("{\"deletedCount\": %d}", count))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Bulk Expenses DELETED - count={}, actorId={}, targetId={}",
                    count, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send bulk expenses deleted event: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendAllExpensesDeletedEvent(int count, UserDTO actorUser, UserDTO targetUser) {
        sendBulkExpensesDeletedEvent(count, actorUser, targetUser);
    }

    


    @Async("friendActivityExecutor")
    public void sendExpenseCopiedEvent(Expense expense, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);
            String expenseName = getExpenseName(expense);

            String description = isOwnAction
                    ? String.format("Expense '%s' copied", expenseName)
                    : String.format("%s copied expense '%s'", actorName, expenseName);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId() != null ? expense.getId().longValue() : null)
                    .entityName(expenseName)
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .amount(getExpenseAmount(expense))
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.EXPENSE_SERVICE)
                    .newValues(buildExpensePayload(expense))
                    .entityPayload(buildExpensePayload(expense))
                    .metadata("{\"action\": \"copy\"}")
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Expense COPIED - expenseId={}, actorId={}, targetId={}",
                    expense.getId(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send expense copied event: {}", e.getMessage(), e);
        }
    }

    
    
    

    private UserInfo buildUserInfo(UserDTO UserDTO) {
        if (UserDTO == null)
            return null;

        return UserInfo.builder()
                .id(UserDTO.getId())
                .username(UserDTO.getUsername())
                .email(UserDTO.getEmail())
                .firstName(UserDTO.getFirstName())
                .lastName(UserDTO.getLastName())
                .fullName(UserDTO.getFullName())
                .image(UserDTO.getImage())
                .build();
    }

    private String getDisplayName(UserDTO UserDTO) {
        if (UserDTO == null)
            return "Unknown";
        if (UserDTO.getFullName() != null && !UserDTO.getFullName().isEmpty()) {
            return UserDTO.getFullName();
        }
        if (UserDTO.getFirstName() != null) {
            return UserDTO.getLastName() != null
                    ? UserDTO.getFirstName() + " " + UserDTO.getLastName()
                    : UserDTO.getFirstName();
        }
        return UserDTO.getUsername() != null ? UserDTO.getUsername() : UserDTO.getEmail();
    }

    private String getExpenseName(Expense expense) {
        if (expense == null)
            return "Expense";
        if (expense.getExpense() != null && expense.getExpense().getExpenseName() != null) {
            return expense.getExpense().getExpenseName();
        }
        return "Expense";
    }

    private String getExpenseDTOName(ExpenseDTO expense) {
        if (expense == null)
            return "Expense";
        if (expense.getExpense() != null && expense.getExpense().getExpenseName() != null) {
            return expense.getExpense().getExpenseName();
        }
        return "Expense";
    }

    private Double getExpenseDTOAmount(ExpenseDTO expense) {
        if (expense == null)
            return null;
        if (expense.getExpense() != null) {
            return expense.getExpense().getAmountAsDouble();
        }
        return null;
    }

    private Double getExpenseAmount(Expense expense) {
        if (expense == null)
            return null;
        if (expense.getExpense() != null) {
            return expense.getExpense().getAmount();
        }
        return null;
    }

    private String getExpenseCategory(Expense expense) {
        if (expense == null)
            return null;
        return expense.getCategoryName();
    }

    private Map<String, Object> buildExpensePayload(Expense expense) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", expense.getId());
        payload.put("date", expense.getDate() != null ? expense.getDate().toString() : null);
        payload.put("categoryName", expense.getCategoryName());
        payload.put("categoryId", expense.getCategoryId());
        if (expense.getExpense() != null) {
            payload.put("expenseName", expense.getExpense().getExpenseName());
            payload.put("amount", expense.getExpense().getAmount());
            payload.put("comments", expense.getExpense().getComments());
            payload.put("paymentMethod", expense.getExpense().getPaymentMethod());
            payload.put("type", expense.getExpense().getType());
        }
        return payload;
    }

    private Map<String, Object> buildExpenseDTOPayload(ExpenseDTO expense) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", expense.getId());
        payload.put("date", expense.getDate());
        payload.put("categoryName", expense.getCategoryName());
        payload.put("categoryId", expense.getCategoryId());
        if (expense.getExpense() != null) {
            payload.put("expenseName", expense.getExpense().getExpenseName());
            payload.put("amount", expense.getExpense().getAmountAsDouble());
            payload.put("comments", expense.getExpense().getComments());
            payload.put("paymentMethod", expense.getExpense().getPaymentMethod());
            payload.put("type", expense.getExpense().getType());
        }
        return payload;
    }

    private String buildExpenseDTOMetadata(ExpenseDTO expense) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("categoryName", expense.getCategoryName());
            metadata.put("categoryId", expense.getCategoryId());
            if (expense.getExpense() != null) {
                metadata.put("paymentMethod", expense.getExpense().getPaymentMethod());
            }
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            return "{}";
        }
    }
}

