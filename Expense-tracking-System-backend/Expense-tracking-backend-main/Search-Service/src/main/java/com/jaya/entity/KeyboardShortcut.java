package com.jaya.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity representing a user's keyboard shortcut configuration.
 * 
 * Each record represents either:
 * 1. A user's custom override for a default shortcut
 * 2. A disabled shortcut
 * 3. A recommendation rejection
 * 
 * Default shortcuts are defined in the frontend and don't need database records
 * unless the user has customized them.
 */
@Entity
@Table(name = "keyboard_shortcuts", indexes = {
        @Index(name = "idx_shortcuts_user_id", columnList = "user_id"),
        @Index(name = "idx_shortcuts_user_action", columnList = "user_id, action_id", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyboardShortcut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * User ID who owns this shortcut configuration
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Action identifier (matches frontend action IDs)
     * e.g., "NEW_EXPENSE", "GO_DASHBOARD", "TOGGLE_THEME"
     */
    @Column(name = "action_id", nullable = false, length = 100)
    private String actionId;

    /**
     * Custom key combination set by the user
     * Format: "mod+shift+e" or "g e" for sequences
     * Null if using default keys
     */
    @Column(name = "custom_keys", length = 50)
    private String customKeys;

    /**
     * Whether this shortcut is enabled
     * False if user has disabled this shortcut
     */
    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    /**
     * Whether the user has rejected the recommendation for this shortcut
     * Used to prevent showing the same recommendation again
     */
    @Column(name = "recommendation_rejected", nullable = false)
    @Builder.Default
    private Boolean recommendationRejected = false;

    /**
     * Number of times this shortcut has been used
     * Used for analytics and recommendation scoring
     */
    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Integer usageCount = 0;

    /**
     * Last time this shortcut was used
     */
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    /**
     * When this record was created
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * When this record was last updated
     */
    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
