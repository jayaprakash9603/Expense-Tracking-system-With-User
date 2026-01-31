package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity representing a shared resource accessible via secure token.
 * The QR code contains only the share URL with token - never raw data.
 * 
 * Business rules:
 * - Token must be cryptographically secure (minimum 128-bit entropy)
 * - Expired shares are automatically disabled
 * - Owner can revoke at any time
 * - resourceRefs use stable business identifiers (externalRef), not database
 * IDs
 */
@Entity
@Table(name = "shared_resources", indexes = {
        @Index(name = "idx_share_token", columnList = "shareToken", unique = true),
        @Index(name = "idx_owner_user_id", columnList = "ownerUserId"),
        @Index(name = "idx_expires_at_active", columnList = "expiresAt, isActive")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Secure, non-guessable token (minimum 128-bit entropy).
     * Used in share URL: /share/{token}
     */
    @Column(nullable = false, unique = true, length = 64)
    private String shareToken;

    /**
     * User ID of the resource owner who created the share.
     */
    @Column(nullable = false)
    private Integer ownerUserId;

    /**
     * Type of resource being shared.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SharedResourceType resourceType;

    /**
     * JSON array of resource references using stable business identifiers.
     * Example: [{"type": "EXPENSE", "externalRef": "TXN_2026_01_25_1200_FOOD"}]
     * 
     * Uses externalRef (not database ID) to survive deletion and re-upload.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "JSON")
    private List<ResourceRef> resourceRefs;

    /**
     * Permission level granted to share recipients.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private SharePermission permission;

    /**
     * Share expiration timestamp. Null means no expiration.
     */
    @Column
    private LocalDateTime expiresAt;

    /**
     * Whether the share is currently active.
     * Set to false when revoked or expired.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    /**
     * Share creation timestamp.
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when share was revoked. Null if not revoked.
     */
    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    /**
     * Optional name/description for the share (helps owner identify shares).
     */
    @Column(length = 255)
    private String shareName;

    /**
     * Count of how many times the share has been accessed.
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer accessCount = 0;

    /**
     * Last access timestamp.
     */
    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    /**
     * Whether the share is public (discoverable by other users).
     * Public shares can be listed on the public shares page.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    /**
     * Check if the share is currently valid (active and not expired).
     */
    public boolean isValid() {
        if (!Boolean.TRUE.equals(isActive)) {
            return false;
        }
        if (expiresAt != null && LocalDateTime.now().isAfter(expiresAt)) {
            return false;
        }
        return true;
    }

    /**
     * Increment access count and update last accessed timestamp.
     */
    public void recordAccess() {
        this.accessCount = (this.accessCount == null ? 0 : this.accessCount) + 1;
        this.lastAccessedAt = LocalDateTime.now();
    }

    /**
     * Revoke the share immediately.
     */
    public void revoke() {
        this.isActive = false;
        this.revokedAt = LocalDateTime.now();
    }

    /**
     * POJO representing a reference to a shared resource.
     * Uses business identifiers (externalRef) instead of database IDs.
     * Stored as JSON in the database - NOT an @Embeddable.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResourceRef implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * Type of the referenced resource.
         */
        private String type;

        /**
         * Internal database ID for lookup.
         */
        private Integer internalId;

        /**
         * Stable business identifier (e.g., TXN_2026_01_25_1200_FOOD).
         * Must survive deletion and re-upload.
         */
        private String externalRef;

        /**
         * Optional display name for UI purposes.
         */
        private String displayName;
    }
}
