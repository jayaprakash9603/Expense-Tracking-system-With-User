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
public class ShareListItem {

    private Long id;
    private String token;
    private String shareUrl;
    private SharedResourceType resourceType;
    private SharePermission permission;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime revokedAt;
    private String shareName;
    private Integer resourceCount;
    private Integer accessCount;
    private LocalDateTime lastAccessedAt;

    private List<ResourceSummary> resources;

    public String getStatus() {
        if (!Boolean.TRUE.equals(isActive)) {
            return revokedAt != null ? "REVOKED" : "INACTIVE";
        }
        if (expiresAt != null && LocalDateTime.now().isAfter(expiresAt)) {
            return "EXPIRED";
        }
        return "ACTIVE";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResourceSummary {
        private String type;
        private String externalRef;
        private String displayName;
    }
}
