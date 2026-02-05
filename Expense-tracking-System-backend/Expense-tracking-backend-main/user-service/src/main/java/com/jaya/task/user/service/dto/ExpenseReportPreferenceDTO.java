package com.jaya.task.user.service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseReportPreferenceDTO {

    private Long id;

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotNull(message = "Layout configuration is required")
    private String layoutConfig; 

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
