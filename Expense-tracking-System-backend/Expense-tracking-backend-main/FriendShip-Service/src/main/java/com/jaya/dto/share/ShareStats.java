package com.jaya.dto.share;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Statistics about user's shares.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareStats {

    /**
     * Total shares ever created.
     */
    private Long totalShares;

    /**
     * Currently active shares.
     */
    private Long activeShares;

    /**
     * Revoked shares.
     */
    private Long revokedShares;

    /**
     * Expired shares.
     */
    private Long expiredShares;

    /**
     * Total access count across all shares.
     */
    private Long totalAccessCount;
}
