package com.jaya.dto;

import lombok.*;

import java.util.List;




@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShortcutsResponse {

    


    private Boolean success;

    


    private String message;

    


    private List<KeyboardShortcutDTO> shortcuts;

    


    private Integer customCount;

    


    private Integer disabledCount;

    


    private Integer rejectedRecommendationsCount;
}
