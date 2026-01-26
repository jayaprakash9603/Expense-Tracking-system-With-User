package com.jaya.dto;

import lombok.*;

import java.util.List;

/**
 * Response DTO for keyboard shortcuts
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortcutsResponse {

    /**
     * Whether the operation was successful
     */
    private Boolean success;

    /**
     * Message describing the result
     */
    private String message;

    /**
     * List of user's shortcut configurations
     */
    private List<KeyboardShortcutDTO> shortcuts;

    /**
     * Count of custom shortcuts
     */
    private Integer customCount;

    /**
     * Count of disabled shortcuts
     */
    private Integer disabledCount;

    /**
     * Count of rejected recommendations
     */
    private Integer rejectedRecommendationsCount;
}
