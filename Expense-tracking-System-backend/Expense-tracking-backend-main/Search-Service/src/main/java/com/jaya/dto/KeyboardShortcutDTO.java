package com.jaya.dto;

import lombok.*;

import java.time.LocalDateTime;




@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyboardShortcutDTO {

    


    private Long id;

    


    private String actionId;

    


    private String customKeys;

    


    private Boolean enabled;

    


    private Boolean recommendationRejected;

    


    private Integer usageCount;

    


    private LocalDateTime lastUsedAt;
}
