package com.jaya.dto;

import lombok.*;

import java.util.List;

/**
 * DTO for shortcut recommendations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortcutRecommendationDTO {

    /**
     * Action identifier
     */
    private String actionId;

    /**
     * Recommended key combination
     */
    private String recommendedKeys;

    /**
     * Description of the action
     */
    private String description;

    /**
     * Category of the shortcut
     */
    private String category;

    /**
     * Recommendation score (0.0 - 1.0)
     */
    private Double score;

    /**
     * Reason for recommending this shortcut
     */
    private String reason;

    /**
     * Number of times user performed this action via UI
     */
    private Integer uiActionCount;

    /**
     * Estimated time saved per day if shortcut is used (seconds)
     */
    private Integer estimatedTimeSaved;
}
