package com.jaya.kafka.service;

import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.Budget;
import com.jaya.models.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        sendBudgetCreatedByFriend(budget, targetUserId, actorUser, null);
    }

    /**
     * Send notification when a friend creates a budget with target user details.
     */
    public void sendBudgetCreatedByFriend(Budget budget, Integer targetUserId, UserDto actorUser, UserDto targetUser) {
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
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.BUDGET)
                    .entityType(FriendActivityEvent.EntityType.BUDGET)
                    .entityId(budget.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created budget '%s' with amount $%.2f",
                            actorName, budget.getName(), budget.getAmount()))
                    .amount(budget.getAmount())
                    .metadata(buildBudgetMetadata(budget))
                    .entityPayload(buildBudgetPayload(budget))
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
        sendBudgetUpdatedByFriend(budget, null, targetUserId, actorUser, null);
    }

    /**
     * Send notification when a friend updates a budget with previous state and
     * target user details.
     */
    public void sendBudgetUpdatedByFriend(Budget budget, Budget previousBudget, Integer targetUserId, UserDto actorUser,
            UserDto targetUser) {
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
                    .sourceService(FriendActivityEvent.SourceService.BUDGET)
                    .entityType(FriendActivityEvent.EntityType.BUDGET)
                    .entityId(budget.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated budget '%s'", actorName, budget.getName()))
                    .amount(budget.getAmount())
                    .entityPayload(buildBudgetPayload(budget))
                    .previousEntityState(previousBudget != null ? buildBudgetPayload(previousBudget) : null)
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
        sendBudgetDeletedByFriend(budgetId, budgetName, amount, null, targetUserId, actorUser, null);
    }

    /**
     * Send notification when a friend deletes a budget with deleted entity details.
     */
    public void sendBudgetDeletedByFriend(Integer budgetId, String budgetName, Double amount, Budget deletedBudget,
            Integer targetUserId, UserDto actorUser, UserDto targetUser) {
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
                    .sourceService(FriendActivityEvent.SourceService.BUDGET)
                    .entityType(FriendActivityEvent.EntityType.BUDGET)
                    .entityId(budgetId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted budget '%s'",
                            actorName, budgetName != null ? budgetName : "a budget"))
                    .amount(amount)
                    .previousEntityState(deletedBudget != null ? buildBudgetPayload(deletedBudget) : null)
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
        sendAllBudgetsDeletedByFriend(targetUserId, actorUser, null, count, null);
    }

    /**
     * Send notification when a friend deletes all budgets with deleted entities
     * details.
     */
    public void sendAllBudgetsDeletedByFriend(Integer targetUserId, UserDto actorUser, UserDto targetUser, int count,
            List<Budget> deletedBudgets) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            // Build payload with deleted budgets info
            Map<String, Object> payload = new HashMap<>();
            payload.put("deletedCount", count);
            if (deletedBudgets != null && !deletedBudgets.isEmpty()) {
                payload.put("deletedBudgets", deletedBudgets.stream().map(this::buildBudgetPayload).toList());
                payload.put("totalAmount", deletedBudgets.stream().mapToDouble(Budget::getAmount).sum());
            }

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.BUDGET)
                    .entityType(FriendActivityEvent.EntityType.BUDGET)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted all budgets (%d items)", actorName, count))
                    .amount(null)
                    .entityPayload(payload)
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

    /**
     * Build UserInfo from UserDto for enhanced event data.
     */
    private FriendActivityEvent.UserInfo buildUserInfo(UserDto user) {
        if (user == null)
            return null;

        String fullName = getActorDisplayName(user);

        return FriendActivityEvent.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName)
                .image(user.getImage())
                .phoneNumber(user.getPhoneNumber())
                .location(user.getLocation())
                .bio(user.getBio())
                .build();
    }

    /**
     * Build complete budget payload as a Map for entity data.
     */
    private Map<String, Object> buildBudgetPayload(Budget budget) {
        if (budget == null)
            return null;

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", budget.getId());
        payload.put("userId", budget.getUserId());
        payload.put("name", budget.getName());
        payload.put("description", budget.getDescription());
        payload.put("amount", budget.getAmount());
        payload.put("remainingAmount", budget.getRemainingAmount());
        payload.put("startDate", budget.getStartDate() != null ? budget.getStartDate().toString() : null);
        payload.put("endDate", budget.getEndDate() != null ? budget.getEndDate().toString() : null);
        payload.put("includeInBudget", budget.isIncludeInBudget());
        payload.put("isBudgetHasExpenses", budget.isBudgetHasExpenses());

        return payload;
    }

    private String buildBudgetMetadata(Budget budget) {
        return String.format("{\"startDate\":\"%s\",\"endDate\":\"%s\",\"description\":\"%s\"}",
                budget.getStartDate() != null ? budget.getStartDate().toString() : "",
                budget.getEndDate() != null ? budget.getEndDate().toString() : "",
                budget.getDescription() != null ? budget.getDescription() : "");
    }
}
