package com.jaya.dto.share;

import com.jaya.models.SharePermission;
import com.jaya.models.SharedResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Paginated response DTO for accessing shared data.
 * Supports loading data in pages with counts per resource type.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedDataPageResponse {

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
     * Type of shared resource (can be MIXED for multiple types).
     */
    private SharedResourceType resourceType;

    /**
     * Share expiration timestamp.
     */
    private LocalDateTime expiresAt;

    /**
     * Information about the share owner.
     */
    private SharedDataResponse.OwnerInfo owner;

    /**
     * Share name if provided.
     */
    private String shareName;

    /**
     * Total count of all shared items across all types.
     */
    private Integer totalCount;

    /**
     * Count per resource type.
     * Key: resource type (EXPENSE, BUDGET, BILL, CATEGORY, PAYMENT_METHOD)
     * Value: count of items of that type
     */
    private Map<String, Integer> countsByType;

    /**
     * Paginated items for the requested resource type.
     */
    private PagedItems pagedItems;

    /**
     * Warnings for any missing data.
     */
    private List<String> warnings;

    /**
     * Paginated items wrapper.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PagedItems {
        /**
         * Resource type being paginated.
         */
        private String resourceType;

        /**
         * List of items for this page.
         */
        private List<SharedDataResponse.SharedItem> items;

        /**
         * Current page number (0-indexed).
         */
        private Integer page;

        /**
         * Page size.
         */
        private Integer size;

        /**
         * Total items for this resource type.
         */
        private Integer totalItems;

        /**
         * Total pages for this resource type.
         */
        private Integer totalPages;

        /**
         * Whether there are more pages.
         */
        private Boolean hasMore;
    }
}
