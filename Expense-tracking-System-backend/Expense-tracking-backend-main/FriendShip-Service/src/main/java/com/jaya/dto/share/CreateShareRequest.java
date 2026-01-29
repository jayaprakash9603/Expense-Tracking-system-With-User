package com.jaya.dto.share;

import com.jaya.models.SharePermission;
import com.jaya.models.SharedResourceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Request DTO for creating a new share.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateShareRequest {

    /**
     * Type of resource being shared.
     */
    @NotNull(message = "Resource type is required")
    private SharedResourceType resourceType;

    /**
     * List of resource references to share.
     * Uses stable business identifiers (externalRef), not database IDs.
     */
    @NotEmpty(message = "At least one resource reference is required")
    @Valid
    private List<ResourceRefDTO> resourceRefs;

    /**
     * Permission level for the share.
     */
    @NotNull(message = "Permission is required")
    private SharePermission permission;

    /**
     * Expiry option: 1, 7, or null for custom.
     */
    private Integer expiryDays;

    /**
     * Custom expiry datetime (used when expiryDays is null).
     */
    private LocalDateTime customExpiry;

    /**
     * Optional name/description for the share.
     */
    @Size(max = 255, message = "Share name cannot exceed 255 characters")
    private String shareName;

    /**
     * Calculate the expiration datetime based on input.
     */
    public LocalDateTime calculateExpiresAt() {
        if (customExpiry != null) {
            return customExpiry;
        }
        if (expiryDays != null && expiryDays > 0) {
            return LocalDateTime.now().plusDays(expiryDays);
        }
        // Default to 7 days if nothing specified
        return LocalDateTime.now().plusDays(7);
    }

    /**
     * Resource reference DTO.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResourceRefDTO {
        /**
         * Type of resource (EXPENSE, CATEGORY, BUDGET).
         */
        @NotBlank(message = "Resource type is required")
        private String type;

        /**
         * Stable business identifier.
         */
        @NotBlank(message = "External reference is required")
        private String externalRef;

        /**
         * Optional display name.
         */
        private String displayName;
    }
}
