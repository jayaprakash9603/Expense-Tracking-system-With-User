package com.jaya.dto.share;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddedItemsDTO {

    private Integer userId;
    private String shareToken;
    private Set<String> addedExternalRefs;
    private Integer addedCount;
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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkAddRequest {
        private java.util.List<AddItemRequest> items;
    }

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
