package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for top expense category analytics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopCategoryDTO {
    private String name;
    private long count;
    private double totalAmount;
    private double percentage;
    private double growthPercentage;
}
