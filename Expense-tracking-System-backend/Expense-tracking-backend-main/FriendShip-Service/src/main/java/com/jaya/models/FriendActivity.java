package com.jaya.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a friend activity record.
 * Tracks actions performed by friends on behalf of another user.
 */
@Entity
@Table(name = "friend_activities", indexes = {
        @Index(name = "idx_target_user_id", columnList = "targetUserId"),
        @Index(name = "idx_actor_user_id", columnList = "actorUserId"),
        @Index(name = "idx_is_read", columnList = "isRead"),
        @Index(name = "idx_timestamp", columnList = "timestamp DESC")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user ID whose account was affected (the account owner).
     */
    @Column(nullable = false)
    private Integer targetUserId;

    /**
     * The user ID who performed the action (the friend).
     */
    @Column(nullable = false)
    private Integer actorUserId;

    /**
     * The display name of the actor.
     */
    private String actorUserName;

    /**
     * The service from which this activity originated.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SourceService sourceService;

    /**
     * The type of entity that was affected.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EntityType entityType;

    /**
     * The ID of the entity that was affected.
     */
    private Integer entityId;

    /**
     * The action that was performed.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Action action;

    /**
     * Human-readable description of the activity.
     */
    @Column(length = 500)
    private String description;

    /**
     * Optional amount involved (for expenses, budget changes, etc.).
     */
    private Double amount;

    /**
     * Additional metadata as JSON string.
     */
    @Column(length = 1000)
    private String metadata;

    /**
     * When the activity occurred.
     */
    @Column(nullable = false)
    private LocalDateTime timestamp;

    /**
     * Whether the activity has been read by the target user.
     */
    @Column(nullable = false)
    private Boolean isRead = false;

    /**
     * When this record was created in the database.
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ==================== NEW FIELDS ====================

    /**
     * Complete actor user info as JSON string.
     */
    @Column(columnDefinition = "TEXT")
    private String actorUserJson;

    /**
     * Complete target user info as JSON string.
     */
    @Column(columnDefinition = "TEXT")
    private String targetUserJson;

    /**
     * Complete entity payload as JSON string.
     */
    @Column(columnDefinition = "TEXT")
    private String entityPayloadJson;

    /**
     * Previous entity state as JSON string (for updates/deletes).
     */
    @Column(columnDefinition = "TEXT")
    private String previousEntityStateJson;

    /**
     * IP address of the actor for audit purposes.
     */
    @Column(length = 50)
    private String actorIpAddress;

    /**
     * User agent of the actor for audit purposes.
     */
    @Column(length = 500)
    private String actorUserAgent;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
    }

    /**
     * Source service enumeration.
     */
    public enum SourceService {
        EXPENSE,
        BUDGET,
        BILL,
        CATEGORY,
        PAYMENT,
        FRIENDSHIP,
        SOCIAL_MEDIA
    }

    /**
     * Entity type enumeration.
     */
    public enum EntityType {
        EXPENSE,
        BUDGET,
        BILL,
        CATEGORY,
        PAYMENT_METHOD,
        FRIEND,
        FRIEND_REQUEST
    }

    /**
     * Action type enumeration.
     */
    public enum Action {
        CREATE,
        UPDATE,
        DELETE,
        COPY,
        APPROVE,
        REJECT,
        ACCEPT,
        DECLINE
    }
}
