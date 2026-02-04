package com.jaya.dto.share;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO for tracking user-added shared items.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddedItemsDTO {

    /**
     * User ID who added the items.
     */
    private Integer userId;

    /**
     * Share token.
     */
    private String shareToken;

    /**
     * Set of external references that have been added.
     */
    private Set<String> addedExternalRefs;

    /**
     * Total count of added items from this share.
     */
    private Integer addedCount;

    /**
     * Request to track an added item.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddItemRequest {
        private String externalRef;
        private String resourceType;
        private Integer originalOwnerId;
        private Integer newItemId;
    }

    /**
     * Response after adding an item.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddItemResponse {
        private Boolean success;
        private Boolean alreadyAdded;
        private String message;
        private LocalDateTime addedAt;
    }

    /**
     * Bulk add request.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkAddRequest {
        private java.util.List<AddItemRequest> items;
    }

    /**
     * Bulk add response.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkAddResponse {
        private Integer successCount;
        private Integer alreadyAddedCount;
        private Integer failedCount;
        private java.util.List<String> errors;
    }
}
