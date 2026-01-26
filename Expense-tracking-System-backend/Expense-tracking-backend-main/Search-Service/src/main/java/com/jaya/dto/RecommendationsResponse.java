package com.jaya.dto;

import lombok.*;

import java.util.List;

/**
 * Response DTO for shortcut recommendations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationsResponse {

    /**
     * Whether the operation was successful
     */
    private Boolean success;

    /**
     * List of recommendations
     */
    private List<ShortcutRecommendationDTO> recommendations;

    /**
     * Total number of potential recommendations
     */
    private Integer totalPotential;

    /**
     * Number of recommendations already rejected by user
     */
    private Integer rejectedCount;
}
