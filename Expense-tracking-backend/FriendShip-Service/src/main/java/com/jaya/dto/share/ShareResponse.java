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
public class ShareResponse {

    private Long id;
    private String token;
    private String shareUrl;
    private String qrCodeDataUri;
    private SharedResourceType resourceType;
    private SharePermission permission;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String shareName;
    private Integer resourceCount;
    private Integer accessCount;
    private String visibility;
    private List<Integer> allowedUserIds;
}
