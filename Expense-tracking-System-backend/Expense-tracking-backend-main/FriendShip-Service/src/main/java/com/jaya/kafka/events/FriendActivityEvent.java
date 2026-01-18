package com.jaya.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Event representing an activity performed by a friend on behalf of another
 * user.
 * This event is consumed from various services (Expense, Budget, Bill, etc.)
 * to track friend activities in the Friendship service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendActivityEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * The user ID whose account was affected (the account owner).
     * This is the user who will see this activity in their feed.
     */
    private Integer targetUserId;

    /**
     * The user ID who performed the action (the friend).
     */
    private Integer actorUserId;

    /**
     * The display name of the actor for convenience.
     */
    private String actorUserName;

    /**
     * The service from which this activity originated.
     * Values: EXPENSE, BUDGET, BILL, CATEGORY, PAYMENT
     */
    private String sourceService;

    /**
     * The type of entity that was affected.
     * Values: EXPENSE, BUDGET, BILL, CATEGORY, PAYMENT_METHOD
     */
    private String entityType;

    /**
     * The ID of the entity that was affected.
     */
    private Integer entityId;

    /**
     * The action that was performed.
     * Values: CREATE, UPDATE, DELETE, COPY
     */
    private String action;

    /**
     * Human-readable description of the activity.
     */
    private String description;

    /**
     * Optional amount involved (for expenses, budget changes, etc.).
     */
    private Double amount;

    /**
     * Additional metadata as JSON string.
     */
    private String metadata;

    /**
     * When the activity occurred.
     */
    private LocalDateTime timestamp;

    /**
     * Whether the activity has been read by the target user.
     */
    private Boolean isRead;

    /**
     * Complete user information of the actor (the friend who performed the action).
     */
    private UserInfo actorUser;

    /**
     * Complete user information of the target (the account owner).
     */
    private UserInfo targetUser;

    /**
     * Complete entity payload data (the full entity that was
     * created/updated/viewed).
     */
    private Map<String, Object> entityPayload;

    /**
     * Previous state of the entity (for update/delete operations).
     */
    private Map<String, Object> previousEntityState;

    /**
     * IP address of the actor for audit purposes.
     */
    private String actorIpAddress;

    /**
     * User agent of the actor for audit purposes.
     */
    private String actorUserAgent;

    /**
     * Inner class representing complete user information.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo implements Serializable {
        private static final long serialVersionUID = 1L;

        private Integer id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String displayName;
        private String image;
        private String coverImage;
        private String phoneNumber;
        private String location;
        private String bio;
    }
}
