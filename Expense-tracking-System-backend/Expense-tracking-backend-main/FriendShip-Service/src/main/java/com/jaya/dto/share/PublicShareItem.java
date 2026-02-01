package com.jaya.dto.share;

import com.jaya.models.SharePermission;
import com.jaya.models.SharedResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for representing a public share visible to all users.
 * Used in the "Public Shares" list.
 */
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

    /**
     * Visibility type (PUBLIC, FRIENDS_ONLY, etc.).
     */
    private String visibility;

    /**
     * Whether the share is currently active.
     */
    private Boolean isActive;

    /**
     * Whether this share belongs to the requesting user.
     * Helps frontend distinguish own shares from others.
     */
    private Boolean isOwnShare;

    /**
     * Owner information (public view).
     */
    private OwnerInfo owner;

    /**
     * Status derived from expiresAt (public shares are always active).
     */
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
