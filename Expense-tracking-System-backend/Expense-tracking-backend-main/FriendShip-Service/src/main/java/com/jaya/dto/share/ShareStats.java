package com.jaya.dto.share;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareStats {

    private Long totalShares;
    private Long activeShares;
    private Long revokedShares;
    private Long expiredShares;
    private Long totalAccessCount;
}
