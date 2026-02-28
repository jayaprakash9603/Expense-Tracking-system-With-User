package com.jaya.dto;

import lombok.*;

import java.util.List;




@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationsResponse {

    


    private Boolean success;

    


    private List<ShortcutRecommendationDTO> recommendations;

    


    private Integer totalPotential;

    


    private Integer rejectedCount;
}
