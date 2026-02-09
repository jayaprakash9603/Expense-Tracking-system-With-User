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
public class PublicShareItem {

    private Long id;
    private String token;
    private String shareUrl;
    private SharedResourceType resourceType;
    private SharePermission permission;
    private String shareName;
    private Integer resourceCount;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private Integer accessCount;

    private String visibility;

    private Boolean isActive;

    private Boolean isOwnShare;

    private OwnerInfo owner;

    public String getStatus() {
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
        private String profileImage;
    }
}
