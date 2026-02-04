package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Common Activity DTO used across all microservices.
 * Represents user activity for feed and activity tracking.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ActivityDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;

    private String eventId;

    // Actor information
    private Integer actorId;

    private String actorName;

    private String actorImage;

    private String actorType;

    // Target information (for actions that affect another user)
    private Integer targetId;

    private String targetName;

    private String targetImage;

    // Entity information
    private String entityType;

    private String entityId;

    private String entityName;

    // Action details
    private String action;

    private String title;

    private String description;

    private String icon;

    private String color;

    // Timestamps
    private LocalDateTime timestamp;

    private String relativeTime;

    // Visibility
    private boolean isPublic;

    private boolean visibleToFriends;

    // Metadata
    private Object metadata;

    // ==================== Action Constants ====================

    public static final String ACTION_CREATED = "CREATED";
    public static final String ACTION_UPDATED = "UPDATED";
    public static final String ACTION_DELETED = "DELETED";
    public static final String ACTION_SHARED = "SHARED";
    public static final String ACTION_LIKED = "LIKED";
    public static final String ACTION_COMMENTED = "COMMENTED";
    public static final String ACTION_ACHIEVED = "ACHIEVED";

    // ==================== Entity Types ====================

    public static final String ENTITY_EXPENSE = "EXPENSE";
    public static final String ENTITY_BUDGET = "BUDGET";
    public static final String ENTITY_BILL = "BILL";
    public static final String ENTITY_CATEGORY = "CATEGORY";
    public static final String ENTITY_FRIENDSHIP = "FRIENDSHIP";
    public static final String ENTITY_ACHIEVEMENT = "ACHIEVEMENT";

    // ==================== Factory Methods ====================

    /**
     * Create an expense activity
     */
    public static ActivityDTO expenseActivity(Integer actorId, String actorName, String action, String expenseId,
            String expenseName, Double amount) {
        return ActivityDTO.builder()
                .actorId(actorId)
                .actorName(actorName)
                .entityType(ENTITY_EXPENSE)
                .entityId(expenseId)
                .entityName(expenseName)
                .action(action)
                .title(getActivityTitle(action, ENTITY_EXPENSE))
                .description(String.format("%s %s expense '%s' for $%.2f", actorName, action.toLowerCase(), expenseName,
                        amount))
                .timestamp(LocalDateTime.now())
                .visibleToFriends(true)
                .build();
    }

    /**
     * Create a budget activity
     */
    public static ActivityDTO budgetActivity(Integer actorId, String actorName, String action, String budgetId,
            String budgetName) {
        return ActivityDTO.builder()
                .actorId(actorId)
                .actorName(actorName)
                .entityType(ENTITY_BUDGET)
                .entityId(budgetId)
                .entityName(budgetName)
                .action(action)
                .title(getActivityTitle(action, ENTITY_BUDGET))
                .description(String.format("%s %s budget '%s'", actorName, action.toLowerCase(), budgetName))
                .timestamp(LocalDateTime.now())
                .visibleToFriends(true)
                .build();
    }

    /**
     * Create a friendship activity
     */
    public static ActivityDTO friendshipActivity(Integer actorId, String actorName, Integer targetId, String targetName,
            String action) {
        return ActivityDTO.builder()
                .actorId(actorId)
                .actorName(actorName)
                .targetId(targetId)
                .targetName(targetName)
                .entityType(ENTITY_FRIENDSHIP)
                .action(action)
                .title("New Friendship")
                .description(String.format("%s and %s are now friends", actorName, targetName))
                .timestamp(LocalDateTime.now())
                .visibleToFriends(true)
                .build();
    }

    private static String getActivityTitle(String action, String entityType) {
        return String.format("%s %s", entityType, action.toLowerCase());
    }
}
