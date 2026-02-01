package com.jaya.dto;

import com.jaya.models.enums.StorySeverity;
import com.jaya.models.enums.StoryStatus;
import com.jaya.models.enums.StoryType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryDTO {
    private UUID id;
    private String title;
    private String content;
    private String imageUrl;
    private String backgroundColor;
    private String backgroundGradient;
    private StoryType storyType;
    private StorySeverity severity;
    private StoryStatus status;
    private Integer targetUserId;
    private Boolean isGlobal;
    private Integer durationSeconds;
    private Integer priority;
    private String referenceId;
    private String referenceType;
    private String metadata;
    private List<StoryCTADTO> ctaButtons;
    private Integer createdByAdminId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime activatedAt;

    // User-specific fields (for response)
    private Boolean seen;
    private LocalDateTime seenAt;
    private Integer viewCount;

    // Computed fields
    private String severityColor;
    private Boolean isExpired;
    private Long remainingSeconds;
}
