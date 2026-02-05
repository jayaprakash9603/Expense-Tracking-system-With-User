package com.jaya.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;












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

    


    @Column(name = "user_id", nullable = false)
    private Long userId;

    



    @Column(name = "action_id", nullable = false, length = 100)
    private String actionId;

    




    @Column(name = "custom_keys", length = 50)
    private String customKeys;

    



    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    



    @Column(name = "recommendation_rejected", nullable = false)
    @Builder.Default
    private Boolean recommendationRejected = false;

    



    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Integer usageCount = 0;

    


    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    


    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    


    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
