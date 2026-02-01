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
 * Response DTO after creating a share.
 * Contains the share URL, QR code, and share details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareResponse {

    /**
     * Unique share ID.
     */
    private Long id;

    /**
     * The secure share token.
     */
    private String token;

    /**
     * Full share URL for direct access.
     * Format: {baseUrl}/share/{token}
     */
    private String shareUrl;

    /**
     * QR code as Base64-encoded data URI.
     * Format: data:image/png;base64,{base64data}
     */
    private String qrCodeDataUri;

    /**
     * Type of resource being shared.
     */
    private SharedResourceType resourceType;

    /**
     * Permission level of the share.
     */
    private SharePermission permission;

    /**
     * Share expiration timestamp.
     */
    private LocalDateTime expiresAt;

    /**
     * Whether the share is currently active.
     */
    private Boolean isActive;

    /**
     * Share creation timestamp.
     */
    private LocalDateTime createdAt;

    /**
     * Optional share name/description.
     */
    private String shareName;

    /**
     * Number of resources shared.
     */
    private Integer resourceCount;

    /**
     * Access count.
     */
    private Integer accessCount;

    /**
     * Visibility level of the share.
     * Values: LINK_ONLY, PUBLIC, FRIENDS_ONLY, SPECIFIC_USERS
     */
    private String visibility;

    /**
     * List of user IDs allowed to access (for SPECIFIC_USERS visibility).
     */
    private List<Integer> allowedUserIds;
}
