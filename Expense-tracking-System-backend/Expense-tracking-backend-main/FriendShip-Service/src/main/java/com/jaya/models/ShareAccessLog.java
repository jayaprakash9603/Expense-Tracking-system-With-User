package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity tracking when a user accesses a shared resource.
 * This enables the "Shared With Me" feature - showing users what has been
 * shared with them.
 */
@Entity
@Table(name = "share_access_logs", indexes = {
        @Index(name = "idx_access_user_id", columnList = "accessingUserId"),
        @Index(name = "idx_access_share_id", columnList = "sharedResourceId"),
        @Index(name = "idx_access_user_share", columnList = "accessingUserId, sharedResourceId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who accessed the share.
     */
    @Column(nullable = false)
    private Integer accessingUserId;

    /**
     * Reference to the shared resource.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sharedResourceId", nullable = false)
    private SharedResource sharedResource;

    /**
     * First access timestamp.
     */
    @CreationTimestamp
    @Column(name = "first_accessed_at", updatable = false)
    private LocalDateTime firstAccessedAt;

    /**
     * Last access timestamp.
     */
    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    /**
     * Number of times this user has accessed this share.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer accessCount = 1;

    /**
     * Whether the user has saved/bookmarked this share.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isSaved = false;

    /**
     * Record a new access.
     */
    public void recordAccess() {
        this.accessCount = (this.accessCount == null ? 0 : this.accessCount) + 1;
        this.lastAccessedAt = LocalDateTime.now();
    }
}
