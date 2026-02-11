package com.jaya.kafka.service;

import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.common.dto.UserDTO;
import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
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
public class FriendActivityService {

    private final FriendActivityProducer friendActivityProducer;

    






    @Async("friendActivityExecutor")
    public void sendExpenseCreatedByFriend(ExpenseDTO expense, Integer targetUserId, UserDTO actorUser) {
        sendExpenseCreatedByFriendInternal(expense, targetUserId, actorUser, null);
    }

    


    @Async("friendActivityExecutor")
    public void sendExpenseCreatedByFriend(ExpenseDTO expense, Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        sendExpenseCreatedByFriendInternal(expense, targetUserId, actorUser, targetUser);
    }

    private void sendExpenseCreatedByFriendInternal(ExpenseDTO expense, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                
                log.debug("Skipping friend activity notification - UserDTO creating own expense");
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            ExpenseDetailsDTO details = expense.getExpense();

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(buildExpenseDescription(expense, actorUser))
                    .amount(details != null ? details.getAmountAsDouble() : 0.0)
                    .metadata(buildExpenseMetadata(expense))
                    .entityPayload(buildExpenseDTOPayload(expense))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} created expense {} for UserDTO {}",
                    actorUser.getId(), expense.getId(), targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for expense creation: {}", e.getMessage(), e);
            
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendExpenseUpdatedByFriend(Expense expense, Integer targetUserId, UserDTO actorUser) {
        sendExpenseUpdatedByFriendInternal(expense, null, targetUserId, actorUser, null);
    }

    



    @Async("friendActivityExecutor")
    public void sendExpenseUpdatedByFriend(Expense expense, Expense previousExpense, Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        sendExpenseUpdatedByFriendInternal(expense, previousExpense, targetUserId, actorUser, targetUser);
    }

    private void sendExpenseUpdatedByFriendInternal(Expense expense, Expense previousExpense, Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            ExpenseDetails details = expense.getExpense();
            String expenseName = details != null ? details.getExpenseName() : "an expense";
            double amount = details != null ? details.getAmount() : 0.0;

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated expense '%s'", actorName, expenseName))
                    .amount(amount)
                    .entityPayload(buildExpensePayload(expense))
                    .previousEntityState(previousExpense != null ? buildExpensePayload(previousExpense) : null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for expense update: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendExpenseDeletedByFriend(Integer expenseId, String expenseName, Double amount,
            Integer targetUserId, UserDTO actorUser) {
        sendExpenseDeletedByFriendInternal(expenseId, expenseName, amount, null, targetUserId, actorUser, null);
    }

    



    @Async("friendActivityExecutor")
    public void sendExpenseDeletedByFriend(Integer expenseId, String expenseName, Double amount, Expense deletedExpense,
            Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        sendExpenseDeletedByFriendInternal(expenseId, expenseName, amount, deletedExpense, targetUserId, actorUser,
                targetUser);
    }

    private void sendExpenseDeletedByFriendInternal(Integer expenseId, String expenseName, Double amount,
            Expense deletedExpense,
            Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(expenseId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted expense '%s'",
                            actorName, expenseName != null ? expenseName : "an expense"))
                    .amount(amount)
                    .previousEntityState(deletedExpense != null ? buildExpensePayload(deletedExpense) : null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for expense deletion: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendExpenseCopiedByFriend(Expense expense, Integer targetUserId, UserDTO actorUser) {
        sendExpenseCopiedByFriendInternal(expense, targetUserId, actorUser, null);
    }

    


    @Async("friendActivityExecutor")
    public void sendExpenseCopiedByFriend(Expense expense, Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        sendExpenseCopiedByFriendInternal(expense, targetUserId, actorUser, targetUser);
    }

    private void sendExpenseCopiedByFriendInternal(Expense expense, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            ExpenseDetails details = expense.getExpense();
            String expenseName = details != null ? details.getExpenseName() : "an expense";
            double amount = details != null ? details.getAmount() : 0.0;

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId())
                    .action(FriendActivityEvent.Action.COPY)
                    .description(String.format("%s copied expense '%s'", actorName, expenseName))
                    .amount(amount)
                    .entityPayload(buildExpensePayload(expense))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for expense copy: {}", e.getMessage(), e);
        }
    }

    



    private String getActorDisplayName(UserDTO actor) {
        if (actor == null) {
            return "A friend";
        }
        String displayName = actor.getDisplayName();
        return (displayName != null && !displayName.trim().isEmpty()) ? displayName : "A friend";
    }

    


    private FriendActivityEvent.UserInfo buildUserInfo(UserDTO UserDTO) {
        if (UserDTO == null)
            return null;

        String fullName = getActorDisplayName(UserDTO);

        return FriendActivityEvent.UserInfo.builder()
                .id(UserDTO.getId())
                .username(UserDTO.getUsername())
                .email(UserDTO.getEmail())
                .firstName(UserDTO.getFirstName())
                .lastName(UserDTO.getLastName())
                .fullName(fullName)
                .image(UserDTO.getImage())
                .coverImage(UserDTO.getCoverImage())
                .phoneNumber(UserDTO.getPhoneNumber())
                .location(UserDTO.getLocation())
                .bio(UserDTO.getBio())
                .build();
    }

    



    private Map<String, Object> buildExpensePayload(Expense expense) {
        if (expense == null)
            return null;

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", expense.getId());
        payload.put("userId", expense.getUserId());
        payload.put("date", expense.getDate() != null ? expense.getDate().toString() : null);
        payload.put("categoryName", expense.getCategoryName());
        payload.put("categoryId", expense.getCategoryId());
        payload.put("includeInBudget", expense.isIncludeInBudget());
        payload.put("isBill", expense.isBill());
        payload.put("budgetIds", expense.getBudgetIds());

        ExpenseDetails details = expense.getExpense();
        if (details != null) {
            payload.put("expenseName", details.getExpenseName());
            payload.put("amount", details.getAmount());
            payload.put("paymentMethod", details.getPaymentMethod());
            payload.put("type", details.getType());
            payload.put("comments", details.getComments());
            payload.put("netAmount", details.getNetAmount());
            payload.put("creditDue", details.getCreditDue());
        }

        return payload;
    }

    


    private Map<String, Object> buildExpenseDTOPayload(ExpenseDTO expense) {
        if (expense == null)
            return null;

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", expense.getId());
        payload.put("userId", expense.getUserId());
        payload.put("date", expense.getDate());
        payload.put("categoryName", expense.getCategoryName());
        payload.put("categoryId", expense.getCategoryId());
        payload.put("includeInBudget", expense.isIncludeInBudget());
        payload.put("isBill", expense.isBill());
        payload.put("budgetIds", expense.getBudgetIds());

        ExpenseDetailsDTO details = expense.getExpense();
        if (details != null) {
            payload.put("expenseName", details.getExpenseName());
            payload.put("amount", details.getAmountAsDouble());
            payload.put("paymentMethod", details.getPaymentMethod());
            payload.put("type", details.getType());
            payload.put("comments", details.getComments());
            payload.put("netAmount", details.getNetAmountAsDouble());
            payload.put("creditDue", details.getCreditDueAsDouble());
        }

        return payload;
    }

    private String buildExpenseDescription(ExpenseDTO expense, UserDTO actor) {
        String actorName = getActorDisplayName(actor);
        ExpenseDetailsDTO details = expense.getExpense();
        String expenseName = (details != null && details.getExpenseName() != null)
                ? details.getExpenseName()
                : "an expense";
        double amount = details != null ? details.getAmountAsDouble() : 0.0;
        return String.format("%s added a new expense '%s' of $%.2f", actorName, expenseName, amount);
    }

    private String buildExpenseMetadata(ExpenseDTO expense) {
        ExpenseDetailsDTO details = expense.getExpense();
        String paymentMethod = (details != null && details.getPaymentMethod() != null)
                ? details.getPaymentMethod()
                : "";
        String type = (details != null && details.getType() != null)
                ? details.getType()
                : "";
        String category = expense.getCategoryName() != null ? expense.getCategoryName() : "";

        return String.format("{\"category\":\"%s\",\"paymentMethod\":\"%s\",\"type\":\"%s\"}",
                category, paymentMethod, type);
    }

    


    @Async("friendActivityExecutor")
    public void sendBulkExpensesCreatedByFriend(List<Expense> expenses, Integer targetUserId, UserDTO actorUser) {
        sendBulkExpensesCreatedByFriendInternal(expenses, targetUserId, actorUser, null);
    }

    



    @Async("friendActivityExecutor")
    public void sendBulkExpensesCreatedByFriend(List<Expense> expenses, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        sendBulkExpensesCreatedByFriendInternal(expenses, targetUserId, actorUser, targetUser);
    }

    private void sendBulkExpensesCreatedByFriendInternal(List<Expense> expenses, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            int count = expenses != null ? expenses.size() : 0;
            double totalAmount = expenses != null ? expenses.stream()
                    .filter(e -> e.getExpense() != null)
                    .mapToDouble(e -> e.getExpense().getAmount())
                    .sum() : 0.0;

            
            Map<String, Object> bulkPayload = new HashMap<>();
            bulkPayload.put("expenseCount", count);
            bulkPayload.put("totalAmount", totalAmount);
            if (expenses != null) {
                bulkPayload.put("expenses", expenses.stream().map(this::buildExpensePayload).toList());
            }

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s added %d expenses totaling $%.2f", actorName, count, totalAmount))
                    .amount(totalAmount)
                    .metadata(String.format("{\"count\":%d}", count))
                    .entityPayload(bulkPayload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} created {} expenses for UserDTO {}", actorUser.getId(), count,
                    targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk expense creation: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendBulkExpensesUpdatedByFriend(List<Expense> expenses, Integer targetUserId, UserDTO actorUser) {
        sendBulkExpensesUpdatedByFriendInternal(expenses, targetUserId, actorUser, null);
    }

    



    @Async("friendActivityExecutor")
    public void sendBulkExpensesUpdatedByFriend(List<Expense> expenses, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        sendBulkExpensesUpdatedByFriendInternal(expenses, targetUserId, actorUser, targetUser);
    }

    private void sendBulkExpensesUpdatedByFriendInternal(List<Expense> expenses, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            int count = expenses != null ? expenses.size() : 0;

            
            Map<String, Object> bulkPayload = new HashMap<>();
            bulkPayload.put("expenseCount", count);
            if (expenses != null) {
                bulkPayload.put("expenses", expenses.stream().map(this::buildExpensePayload).toList());
            }

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated %d expenses", actorName, count))
                    .amount(null)
                    .metadata(String.format("{\"count\":%d}", count))
                    .entityPayload(bulkPayload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} updated {} expenses for UserDTO {}", actorUser.getId(), count,
                    targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk expense update: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendBulkExpensesDeletedByFriend(int count, Integer targetUserId, UserDTO actorUser) {
        sendBulkExpensesDeletedByFriendInternal(count, null, targetUserId, actorUser, null);
    }

    



    @Async("friendActivityExecutor")
    public void sendBulkExpensesDeletedByFriend(int count, List<Expense> deletedExpenses, Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        sendBulkExpensesDeletedByFriendInternal(count, deletedExpenses, targetUserId, actorUser, targetUser);
    }

    private void sendBulkExpensesDeletedByFriendInternal(int count, List<Expense> deletedExpenses, Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            
            Map<String, Object> payload = new HashMap<>();
            payload.put("deletedCount", count);
            if (deletedExpenses != null && !deletedExpenses.isEmpty()) {
                payload.put("deletedExpenses", deletedExpenses.stream().map(this::buildExpensePayload).toList());
                payload.put("totalAmount", deletedExpenses.stream()
                        .filter(e -> e.getExpense() != null)
                        .mapToDouble(e -> e.getExpense().getAmount())
                        .sum());
            }

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted %d expenses", actorName, count))
                    .amount(null)
                    .metadata(String.format("{\"count\":%d}", count))
                    .entityPayload(payload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} deleted {} expenses for UserDTO {}", actorUser.getId(), count,
                    targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk expense deletion: {}", e.getMessage(), e);
        }
    }

    


    @Async("friendActivityExecutor")
    public void sendAllExpensesDeletedByFriend(int count, Integer targetUserId, UserDTO actorUser) {
        sendAllExpensesDeletedByFriendInternal(count, null, targetUserId, actorUser, null);
    }

    



    @Async("friendActivityExecutor")
    public void sendAllExpensesDeletedByFriend(int count, List<Expense> deletedExpenses, Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        sendAllExpensesDeletedByFriendInternal(count, deletedExpenses, targetUserId, actorUser, targetUser);
    }

    private void sendAllExpensesDeletedByFriendInternal(int count, List<Expense> deletedExpenses, Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            
            Map<String, Object> payload = new HashMap<>();
            payload.put("deletedCount", count);
            payload.put("deleteAll", true);
            if (deletedExpenses != null && !deletedExpenses.isEmpty()) {
                payload.put("deletedExpenses", deletedExpenses.stream().map(this::buildExpensePayload).toList());
                payload.put("totalAmount", deletedExpenses.stream()
                        .filter(e -> e.getExpense() != null)
                        .mapToDouble(e -> e.getExpense().getAmount())
                        .sum());
            }

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted all expenses (%d total)", actorName, count))
                    .amount(null)
                    .metadata(String.format("{\"count\":%d,\"deleteAll\":true}", count))
                    .entityPayload(payload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} deleted all {} expenses for UserDTO {}", actorUser.getId(), count,
                    targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for delete all expenses: {}", e.getMessage(), e);
        }
    }
}
