package com.jaya.kafka.service;

import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.Budget;
import com.jaya.models.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for sending friend activity notifications for budget operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FriendActivityService {

    private final FriendActivityProducer friendActivityProducer;

    /**
     * Send notification when a friend creates a budget on behalf of another user.
     */
    public void sendBudgetCreatedByFriend(Budget budget, Integer targetUserId, UserDto actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                log.debug("Skipping friend activity notification - user creating own budget");
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.BUDGET)
                    .entityType(FriendActivityEvent.EntityType.BUDGET)
                    .entityId(budget.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created budget '%s' with amount $%.2f",
                            actorName, budget.getName(), budget.getAmount()))
                    .amount(budget.getAmount())
                    .metadata(buildBudgetMetadata(budget))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} created budget {} for user {}",
                    actorUser.getId(), budget.getId(), targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for budget creation: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend updates a budget.
     */
    public void sendBudgetUpdatedByFriend(Budget budget, Integer targetUserId, UserDto actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.BUDGET)
                    .entityType(FriendActivityEvent.EntityType.BUDGET)
                    .entityId(budget.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated budget '%s'", actorName, budget.getName()))
                    .amount(budget.getAmount())
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for budget update: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes a budget.
     */
    public void sendBudgetDeletedByFriend(Integer budgetId, String budgetName, Double amount,
            Integer targetUserId, UserDto actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.BUDGET)
                    .entityType(FriendActivityEvent.EntityType.BUDGET)
                    .entityId(budgetId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted budget '%s'",
                            actorName, budgetName != null ? budgetName : "a budget"))
                    .amount(amount)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for budget deletion: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes all budgets.
     */
    public void sendAllBudgetsDeletedByFriend(Integer targetUserId, UserDto actorUser, int count) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.BUDGET)
                    .entityType(FriendActivityEvent.EntityType.BUDGET)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted all budgets (%d items)", actorName, count))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk budget deletion: {}", e.getMessage(), e);
        }
    }

    private String getActorDisplayName(UserDto user) {
        if (user.getFirstName() != null && !user.getFirstName().isEmpty()) {
            if (user.getLastName() != null && !user.getLastName().isEmpty()) {
                return user.getFirstName() + " " + user.getLastName();
            }
            return user.getFirstName();
        }
        return user.getUsername() != null ? user.getUsername() : "A friend";
    }

    private String buildBudgetMetadata(Budget budget) {
        return String.format("{\"startDate\":\"%s\",\"endDate\":\"%s\",\"description\":\"%s\"}",
                budget.getStartDate() != null ? budget.getStartDate().toString() : "",
                budget.getEndDate() != null ? budget.getEndDate().toString() : "",
                budget.getDescription() != null ? budget.getDescription() : "");
    }
}
