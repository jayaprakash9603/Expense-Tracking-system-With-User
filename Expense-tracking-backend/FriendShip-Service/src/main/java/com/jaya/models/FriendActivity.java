package com.jaya.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    @Column(nullable = false)
    private Integer targetUserId;

    @Column(nullable = false)
    private Integer actorUserId;

    private String actorUserName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SourceService sourceService;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EntityType entityType;

    private Integer entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Action action;

    @Column(length = 500)
    private String description;

    private Double amount;

    @Column(length = 1000)
    private String metadata;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String actorUserJson;

    @Column(columnDefinition = "TEXT")
    private String targetUserJson;

    @Column(columnDefinition = "TEXT")
    private String entityPayloadJson;

    @Column(columnDefinition = "TEXT")
    private String previousEntityStateJson;

    @Column(length = 50)
    private String actorIpAddress;

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

    public enum SourceService {
        EXPENSE,
        BUDGET,
        BILL,
        CATEGORY,
        PAYMENT,
        FRIENDSHIP,
        SOCIAL_MEDIA
    }

    public enum EntityType {
        EXPENSE,
        BUDGET,
        BILL,
        CATEGORY,
        PAYMENT_METHOD,
        FRIEND,
        FRIEND_REQUEST
    }

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
