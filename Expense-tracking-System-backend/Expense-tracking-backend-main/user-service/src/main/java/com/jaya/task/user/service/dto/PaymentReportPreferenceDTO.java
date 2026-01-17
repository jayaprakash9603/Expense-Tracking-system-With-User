package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Payment Report layout preferences.
 * Follows the same pattern as CategoryReportPreferenceDTO for consistency.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReportPreferenceDTO {

    private Long id;
    private Integer userId;
    private String layoutConfig;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
