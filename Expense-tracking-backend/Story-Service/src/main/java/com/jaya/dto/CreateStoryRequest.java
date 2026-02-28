package com.jaya.dto;

import com.jaya.models.enums.StorySeverity;
import com.jaya.models.enums.StoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
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

    
    private Integer targetUserId;

    
    private Boolean isGlobal = true;

    
    private Integer durationSeconds = 5;

    
    private Integer priority = 0;

    
    private String referenceId;
    private String referenceType;

    
    private String metadata;

    
    private Integer expirationHours = 24;

    
    private List<StoryCTADTO> ctaButtons;

    
    private Boolean autoActivate = true;
}
