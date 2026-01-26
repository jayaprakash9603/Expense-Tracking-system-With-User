package com.jaya.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for keyboard shortcut data transfer
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyboardShortcutDTO {

    /**
     * Unique identifier
     */
    private Long id;

    /**
     * Action identifier (e.g., "NEW_EXPENSE", "GO_DASHBOARD")
     */
    private String actionId;

    /**
     * Custom key combination (null if using default)
     */
    private String customKeys;

    /**
     * Whether the shortcut is enabled
     */
    private Boolean enabled;

    /**
     * Whether recommendation was rejected
     */
    private Boolean recommendationRejected;

    /**
     * Usage count for this shortcut
     */
    private Integer usageCount;

    /**
     * Last time the shortcut was used
     */
    private LocalDateTime lastUsedAt;
}
