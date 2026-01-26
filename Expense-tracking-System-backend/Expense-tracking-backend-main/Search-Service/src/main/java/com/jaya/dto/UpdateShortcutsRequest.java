package com.jaya.dto;

import lombok.*;

import jakarta.validation.constraints.*;
import java.util.List;

/**
 * Request DTO for updating keyboard shortcuts
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShortcutsRequest {

    /**
     * List of shortcut updates to apply
     */
    @NotNull(message = "Shortcuts list is required")
    private List<ShortcutUpdate> shortcuts;

    /**
     * Individual shortcut update
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShortcutUpdate {

        /**
         * Action identifier (required)
         */
        @NotBlank(message = "Action ID is required")
        @Size(max = 100, message = "Action ID must be at most 100 characters")
        private String actionId;

        /**
         * Custom key combination (null to use default)
         */
        @Size(max = 50, message = "Custom keys must be at most 50 characters")
        private String customKeys;

        /**
         * Whether to enable or disable the shortcut
         */
        private Boolean enabled;

        /**
         * Whether to mark recommendation as rejected
         */
        private Boolean rejectRecommendation;
    }
}
