package com.jaya.dto.share;

import com.jaya.models.SharePermission;
import com.jaya.models.SharedResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for accessing shared data.
 * Contains the actual shared resources and metadata.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedDataResponse {

    /**
     * Whether the share is valid.
     */
    private Boolean isValid;

    /**
     * Reason if share is invalid (expired, revoked, not found).
     */
    private String invalidReason;

    /**
     * Permission level for this share.
     */
    private SharePermission permission;

    /**
     * Type of shared resource.
     */
    private SharedResourceType resourceType;

    /**
     * Share expiration timestamp.
     */
    private LocalDateTime expiresAt;

    /**
     * Information about the share owner.
     */
    private OwnerInfo owner;

    /**
     * The actual shared data (expenses, categories, budgets).
     */
    private List<SharedItem> items;

    /**
     * Warnings for any missing data.
     * E.g., "2 expenses no longer exist"
     */
    private List<String> warnings;

    /**
     * Total count of originally shared items.
     */
    private Integer originalCount;

    /**
     * Count of items actually returned (some may have been deleted).
     */
    private Integer returnedCount;

    /**
     * Share name if provided.
     */
    private String shareName;

    /**
     * Owner information for display.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OwnerInfo {
        private Integer id;
        private String name;
        private String email;
        private String avatarUrl;
    }

    /**
     * Generic shared item wrapper.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SharedItem {
        /**
         * Type of the item.
         */
        private String type;

        /**
         * External reference (business identifier).
         */
        private String externalRef;

        /**
         * The actual item data (expense, category, or budget).
         */
        private Object data;

        /**
         * Whether this item was found or is missing.
         */
        private Boolean found;
    }
}
