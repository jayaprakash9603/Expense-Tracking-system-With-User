package com.jaya.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.UnifiedActivityEvent;
import com.jaya.kafka.events.UnifiedActivityEvent.UserInfo;
import com.jaya.kafka.producer.UnifiedActivityEventProducer;
import com.jaya.models.Budget;
import com.jaya.models.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Unified Activity Service for Budget Service.
 * Replaces separate FriendActivityService and BudgetNotificationService.
 * 
 * All events are sent to the single unified-activity-events topic.
 * The routing flags determine how the event is processed by consumers:
 * - isOwnAction=true -> Regular notification
 * - isFriendActivity=true -> Friend activity notification
 * - requiresAudit=true -> Audit logging
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityService {

    private final UnifiedActivityEventProducer eventProducer;
    private final ObjectMapper objectMapper;

    // =============================================
    // BUDGET CREATED EVENTS
    // =============================================

    /**
     * Send event when a budget is created (own action or friend action)
     */
    @Async("friendActivityExecutor")
    public void sendBudgetCreatedEvent(Budget budget, UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Budget '%s' created for $%.2f", budget.getName(), budget.getAmount())
                    : String.format("%s created budget '%s' with amount $%.2f", actorName, budget.getName(),
                            budget.getAmount());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.BUDGET)
                    .entityId(budget.getId().longValue())
                    .entityName(budget.getName())
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .amount(budget.getAmount())
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorEmail(actorUser.getEmail())
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.BUDGET_SERVICE)
                    .newValues(buildBudgetPayload(budget))
                    .entityPayload(buildBudgetPayload(budget))
                    .metadata(buildBudgetMetadata(budget))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Budget CREATED - budgetId={}, actorId={}, targetId={}, isOwnAction={}",
                    budget.getId(), actorUser.getId(), targetUser.getId(), isOwnAction);

        } catch (Exception e) {
            log.error("Failed to send budget created event: {}", e.getMessage(), e);
        }
    }

    // =============================================
    // BUDGET UPDATED EVENTS
    // =============================================

    /**
     * Send event when a budget is updated
     */
    @Async("friendActivityExecutor")
    public void sendBudgetUpdatedEvent(Budget budget, Budget oldBudget, UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Budget '%s' updated", budget.getName())
                    : String.format("%s updated budget '%s'", actorName, budget.getName());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.BUDGET)
                    .entityId(budget.getId().longValue())
                    .entityName(budget.getName())
                    .action(UnifiedActivityEvent.Action.UPDATE)
                    .description(description)
                    .amount(budget.getAmount())
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.BUDGET_SERVICE)
                    .oldValues(oldBudget != null ? buildBudgetPayload(oldBudget) : null)
                    .newValues(buildBudgetPayload(budget))
                    .entityPayload(buildBudgetPayload(budget))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Budget UPDATED - budgetId={}, actorId={}, targetId={}",
                    budget.getId(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send budget updated event: {}", e.getMessage(), e);
        }
    }

    // =============================================
    // BUDGET DELETED EVENTS
    // =============================================

    /**
     * Send event when a budget is deleted
     */
    @Async("friendActivityExecutor")
    public void sendBudgetDeletedEvent(Integer budgetId, String budgetName, Double amount, UserDto actorUser,
            UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Budget '%s' deleted", budgetName)
                    : String.format("%s deleted budget '%s'", actorName, budgetName);

            Map<String, Object> oldValues = new HashMap<>();
            oldValues.put("id", budgetId);
            oldValues.put("name", budgetName);
            if (amount != null)
                oldValues.put("amount", amount);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.BUDGET)
                    .entityId(budgetId.longValue())
                    .entityName(budgetName)
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .amount(amount)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.BUDGET_SERVICE)
                    .oldValues(oldValues)
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Budget DELETED - budgetId={}, actorId={}, targetId={}",
                    budgetId, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send budget deleted event: {}", e.getMessage(), e);
        }
    }

    /**
     * Send event when all budgets are deleted
     */
    @Async("friendActivityExecutor")
    public void sendAllBudgetsDeletedEvent(int count, UserDto actorUser, UserDto targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("All %d budgets deleted", count)
                    : String.format("%s deleted all %d budgets", actorName, count);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.BUDGET)
                    .entityName("All Budgets")
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.BUDGET_SERVICE)
                    .metadata(String.format("{\"deletedCount\": %d}", count))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: All Budgets DELETED - count={}, actorId={}, targetId={}",
                    count, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send all budgets deleted event: {}", e.getMessage(), e);
        }
    }

    // =============================================
    // HELPER METHODS
    // =============================================

    private UserInfo buildUserInfo(UserDto user) {
        if (user == null)
            return null;

        String fullName = buildFullName(user);
        return UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName)
                .image(user.getImage())
                .build();
    }

    private String buildFullName(UserDto user) {
        if (user == null)
            return null;
        if (user.getFirstName() != null && user.getLastName() != null) {
            return user.getFirstName() + " " + user.getLastName();
        }
        if (user.getFirstName() != null) {
            return user.getFirstName();
        }
        return user.getUsername();
    }

    private String getDisplayName(UserDto user) {
        if (user == null)
            return "Unknown";
        String fullName = buildFullName(user);
        if (fullName != null && !fullName.isEmpty()) {
            return fullName;
        }
        return user.getUsername() != null ? user.getUsername() : user.getEmail();
    }

    private Map<String, Object> buildBudgetPayload(Budget budget) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", budget.getId());
        payload.put("name", budget.getName());
        payload.put("amount", budget.getAmount());
        payload.put("description", budget.getDescription());
        payload.put("startDate", budget.getStartDate() != null ? budget.getStartDate().toString() : null);
        payload.put("endDate", budget.getEndDate() != null ? budget.getEndDate().toString() : null);
        payload.put("remainingAmount", budget.getRemainingAmount());
        payload.put("isBudgetHasExpenses", budget.isBudgetHasExpenses());
        return payload;
    }

    private String buildBudgetMetadata(Budget budget) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("startDate", budget.getStartDate() != null ? budget.getStartDate().toString() : null);
            metadata.put("endDate", budget.getEndDate() != null ? budget.getEndDate().toString() : null);
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            return "{}";
        }
    }
}
