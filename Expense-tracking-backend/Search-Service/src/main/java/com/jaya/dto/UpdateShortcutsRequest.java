package com.jaya.dto;

import lombok.*;

import jakarta.validation.constraints.*;
import java.util.List;




@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateShortcutsRequest {

    


    @NotNull(message = "Shortcuts list is required")
    private List<ShortcutUpdate> shortcuts;

    


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShortcutUpdate {

        


        @NotBlank(message = "Action ID is required")
        @Size(max = 100, message = "Action ID must be at most 100 characters")
        private String actionId;

        


        @Size(max = 50, message = "Custom keys must be at most 50 characters")
        private String customKeys;

        


        private Boolean enabled;

        


        private Boolean rejectRecommendation;
    }
}
