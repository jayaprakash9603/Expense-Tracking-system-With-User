package com.jaya.dto;

import com.jaya.models.enums.StorySeverity;
import com.jaya.models.enums.StoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStoryRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String content;

    private String imageUrl;

    private String backgroundColor;

    private String backgroundGradient;

    @NotNull(message = "Story type is required")
    private StoryType storyType;

    @NotNull(message = "Severity is required")
    private StorySeverity severity;

    // Target user ID (null = global story)
    private Integer targetUserId;

    // Default: true (visible to all)
    private Boolean isGlobal = true;

    // Default: 5 seconds
    private Integer durationSeconds = 5;

    // Priority (higher = shown first)
    private Integer priority = 0;

    // Reference to related entity
    private String referenceId;
    private String referenceType;

    // Additional metadata as JSON
    private String metadata;

    // Expiration in hours (default 24)
    private Integer expirationHours = 24;

    // CTA buttons
    private List<StoryCTADTO> ctaButtons;

    // Auto-activate on creation
    private Boolean autoActivate = true;
}
