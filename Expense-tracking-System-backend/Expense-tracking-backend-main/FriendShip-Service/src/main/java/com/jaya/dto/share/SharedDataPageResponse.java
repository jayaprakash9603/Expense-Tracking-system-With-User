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
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedDataPageResponse {

    private Boolean isValid;
    private String invalidReason;
    private SharePermission permission;
    private SharedResourceType resourceType;
    private LocalDateTime expiresAt;
    private SharedDataResponse.OwnerInfo owner;
    private String shareName;
    private Integer totalCount;
    private Map<String, Integer> countsByType;
    private PagedItems pagedItems;
    private List<String> warnings;
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PagedItems {
        private String resourceType;
        private List<SharedDataResponse.SharedItem> items;
        private Integer page;
        private Integer size;
        private Integer totalItems;
        private Integer totalPages;
        private Boolean hasMore;
    }
}
