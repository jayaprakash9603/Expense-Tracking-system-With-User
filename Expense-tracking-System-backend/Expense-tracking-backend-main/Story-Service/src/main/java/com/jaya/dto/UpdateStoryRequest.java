package com.jaya.dto;

import com.jaya.models.enums.StorySeverity;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStoryRequest {
    private String title;
    private String content;
    private String imageUrl;
    private String backgroundColor;
    private String backgroundGradient;
    private StorySeverity severity;
    private Integer durationSeconds;
    private Integer priority;
    private String metadata;
    private Integer expirationHours;
    private List<StoryCTADTO> ctaButtons;
}
