package com.jaya.dto.share;

import com.jaya.models.SharePermission;
import com.jaya.models.SharedResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedWithMeItem {

    private Long shareId;
    private String token;
    private String shareUrl;
    private SharedResourceType resourceType;
    private SharePermission permission;
    private String shareName;
    private Integer resourceCount;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private LocalDateTime firstAccessedAt;
    private LocalDateTime lastAccessedAt;
    private Integer myAccessCount;
    private Boolean isSaved;

    private OwnerInfo owner;

    public String getStatus() {
        if (!Boolean.TRUE.equals(isActive)) {
            return "REVOKED";
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
    public static class OwnerInfo {
        private Integer id;
        private String firstName;
        private String lastName;
        private String username;
        private String email;
        private String profileImage;
    }
}
