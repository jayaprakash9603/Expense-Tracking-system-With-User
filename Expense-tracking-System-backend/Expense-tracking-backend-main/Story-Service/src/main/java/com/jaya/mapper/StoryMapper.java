package com.jaya.mapper;

import com.jaya.dto.StoryCTADTO;
import com.jaya.dto.StoryDTO;
import com.jaya.models.Story;
import com.jaya.models.StoryCTA;
import com.jaya.models.StoryVisibility;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class StoryMapper {

    public StoryDTO toDTO(Story story) {
        return toDTO(story, null);
    }

    public StoryDTO toDTO(Story story, StoryVisibility visibility) {
        if (story == null)
            return null;

        StoryDTO dto = StoryDTO.builder()
                .id(story.getId())
                .title(story.getTitle())
                .content(story.getContent())
                .imageUrl(story.getImageUrl())
                .backgroundColor(story.getBackgroundColor())
                .backgroundGradient(story.getBackgroundGradient())
                .storyType(story.getStoryType())
                .severity(story.getSeverity())
                .status(story.getStatus())
                .targetUserId(story.getTargetUserId())
                .isGlobal(story.getIsGlobal())
                .durationSeconds(story.getDurationSeconds())
                .priority(story.getPriority())
                .referenceId(story.getReferenceId())
                .referenceType(story.getReferenceType())
                .metadata(story.getMetadata())
                .createdByAdminId(story.getCreatedByAdminId())
                .createdAt(story.getCreatedAt())
                .expiresAt(story.getExpiresAt())
                .activatedAt(story.getActivatedAt())
                .severityColor(story.getSeverity().getColorCode())
                .isExpired(story.isExpired())
                .build();

        
        if (story.getCtaButtons() != null && !story.getCtaButtons().isEmpty()) {
            dto.setCtaButtons(story.getCtaButtons().stream()
                    .map(this::toCTADTO)
                    .collect(Collectors.toList()));
        }

        
        if (!story.isExpired()) {
            long remaining = Duration.between(LocalDateTime.now(), story.getExpiresAt()).getSeconds();
            dto.setRemainingSeconds(Math.max(0, remaining));
        } else {
            dto.setRemainingSeconds(0L);
        }

        
        if (visibility != null) {
            dto.setSeen(visibility.getSeen());
            dto.setSeenAt(visibility.getSeenAt());
            dto.setViewCount(visibility.getViewCount());
        } else {
            dto.setSeen(false);
            dto.setViewCount(0);
        }

        return dto;
    }

    public List<StoryDTO> toDTOList(List<Story> stories, Map<UUID, StoryVisibility> visibilityMap) {
        return stories.stream()
                .map(story -> toDTO(story, visibilityMap.get(story.getId())))
                .collect(Collectors.toList());
    }

    public StoryCTADTO toCTADTO(StoryCTA cta) {
        if (cta == null)
            return null;

        return StoryCTADTO.builder()
                .id(cta.getId())
                .label(cta.getLabel())
                .ctaType(cta.getCtaType())
                .actionUrl(cta.getActionUrl())
                .routePath(cta.getRoutePath())
                .actionData(cta.getActionData())
                .buttonColor(cta.getButtonColor())
                .textColor(cta.getTextColor())
                .displayOrder(cta.getDisplayOrder())
                .isPrimary(cta.getIsPrimary())
                .build();
    }

    public StoryCTA toEntity(StoryCTADTO dto) {
        if (dto == null)
            return null;

        return StoryCTA.builder()
                .label(dto.getLabel())
                .ctaType(dto.getCtaType())
                .actionUrl(dto.getActionUrl())
                .routePath(dto.getRoutePath())
                .actionData(dto.getActionData())
                .buttonColor(dto.getButtonColor())
                .textColor(dto.getTextColor())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .isPrimary(dto.getIsPrimary() != null ? dto.getIsPrimary() : false)
                .build();
    }
}
