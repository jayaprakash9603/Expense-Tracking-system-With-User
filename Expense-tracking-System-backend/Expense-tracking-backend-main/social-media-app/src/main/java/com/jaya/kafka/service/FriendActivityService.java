package com.jaya.kafka.service;

import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.dto.User;
import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service for sending friend activity notifications.
 * Encapsulates the logic for building and sending FriendActivityEvents.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FriendActivityService {

    private final FriendActivityProducer friendActivityProducer;

    /**
     * Send notification when a friend creates an expense on behalf of another user.
     *
     * @param expense      The created expense
     * @param targetUserId The user whose account was affected (owner)
     * @param actorUser    The friend who created the expense
     */
    public void sendExpenseCreatedByFriend(ExpenseDTO expense, Integer targetUserId, User actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                // User is creating their own expense, not a friend activity
                log.debug("Skipping friend activity notification - user creating own expense");
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            ExpenseDetailsDTO details = expense.getExpense();

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(buildExpenseDescription(expense, actorUser))
                    .amount(details != null ? details.getAmountAsDouble() : 0.0)
                    .metadata(buildExpenseMetadata(expense))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} created expense {} for user {}",
                    actorUser.getId(), expense.getId(), targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for expense creation: {}", e.getMessage(), e);
            // Don't throw - notification failure shouldn't fail the main operation
        }
    }

    /**
     * Send notification when a friend updates an expense.
     */
    public void sendExpenseUpdatedByFriend(Expense expense, Integer targetUserId, User actorUser) {
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
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated expense '%s'", actorName, expenseName))
                    .amount(amount)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for expense update: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes an expense.
     */
    public void sendExpenseDeletedByFriend(Integer expenseId, String expenseName, Double amount,
            Integer targetUserId, User actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(expenseId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted expense '%s'",
                            actorName, expenseName != null ? expenseName : "an expense"))
                    .amount(amount)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for expense deletion: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend copies an expense.
     */
    public void sendExpenseCopiedByFriend(Expense expense, Integer targetUserId, User actorUser) {
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
                    .sourceService(FriendActivityEvent.SourceService.EXPENSE)
                    .entityType(FriendActivityEvent.EntityType.EXPENSE)
                    .entityId(expense.getId())
                    .action(FriendActivityEvent.Action.COPY)
                    .description(String.format("%s copied expense '%s'", actorName, expenseName))
                    .amount(amount)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for expense copy: {}", e.getMessage(), e);
        }
    }

    /**
     * Get display name for the actor user.
     * Uses the User's getDisplayName() helper method which handles null checks.
     */
    private String getActorDisplayName(User actor) {
        if (actor == null) {
            return "A friend";
        }
        String displayName = actor.getDisplayName();
        return (displayName != null && !displayName.trim().isEmpty()) ? displayName : "A friend";
    }

    private String buildExpenseDescription(ExpenseDTO expense, User actor) {
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
}
