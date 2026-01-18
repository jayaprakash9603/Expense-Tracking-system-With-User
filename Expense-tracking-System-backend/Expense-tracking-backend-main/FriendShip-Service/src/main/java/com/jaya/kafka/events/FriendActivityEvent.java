package com.jaya.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

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
     */
    private SourceService sourceService;

    /**
     * The type of entity that was affected.
     */
    private EntityType entityType;

    /**
     * The ID of the entity that was affected.
     */
    private Integer entityId;

    /**
     * The action that was performed.
     */
    private Action action;

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
     * Source service enumeration.
     */
    public enum SourceService {
        EXPENSE,
        BUDGET,
        BILL,
        CATEGORY,
        PAYMENT
    }

    /**
     * Entity type enumeration.
     */
    public enum EntityType {
        EXPENSE,
        BUDGET,
        BILL,
        CATEGORY,
        PAYMENT_METHOD
    }

    /**
     * Action type enumeration.
     */
    public enum Action {
        CREATE,
        UPDATE,
        DELETE,
        COPY
    }
}
