package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryReportPreferenceDTO {

    private Long id;
    private Integer userId;
    private String layoutConfig;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
