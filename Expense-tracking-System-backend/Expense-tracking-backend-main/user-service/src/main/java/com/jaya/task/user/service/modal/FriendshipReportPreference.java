package com.jaya.task.user.service.modal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for storing user-specific Friendship Report layout preferences.
 * Allows users to customize which sections are visible and their order.
 */
@Entity
@Table(name = "friendship_report_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipReportPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", unique = true, nullable = false)
    private Integer userId;

    @NotNull(message = "Layout configuration is required")
    @Column(name = "layout_config", columnDefinition = "TEXT", nullable = false)
    private String layoutConfig; // JSON string storing the friendship report sections configuration

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
