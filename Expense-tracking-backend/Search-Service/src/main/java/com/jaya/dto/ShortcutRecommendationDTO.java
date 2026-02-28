package com.jaya.dto;

import lombok.*;

import java.util.List;




@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortcutRecommendationDTO {

    


    private String actionId;

    


    private String recommendedKeys;

    


    private String description;

    


    private String category;

    


    private Double score;

    


    private String reason;

    


    private Integer uiActionCount;

    


    private Integer estimatedTimeSaved;
}
