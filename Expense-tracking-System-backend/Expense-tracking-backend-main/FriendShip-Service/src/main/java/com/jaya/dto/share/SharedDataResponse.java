package com.jaya.dto.share;

import com.jaya.models.SharePermission;
import com.jaya.models.SharedResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedDataResponse {

    private Boolean isValid;
    private String invalidReason;
    private SharePermission permission;
    private SharedResourceType resourceType;
    private LocalDateTime expiresAt;
    private OwnerInfo owner;
    private List<SharedItem> items;
    private List<String> warnings;
    private Integer originalCount;
    private Integer returnedCount;
    private String shareName;

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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SharedItem {
        private String type;
        private String externalRef;
        private Object data;
        private Boolean found;
    }
}
