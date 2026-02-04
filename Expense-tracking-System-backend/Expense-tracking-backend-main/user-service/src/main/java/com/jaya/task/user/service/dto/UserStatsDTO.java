package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for user statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private long total;
    private long active;
    private long inactive;
    private long suspended;
    private long newThisMonth;
    private long newThisWeek;
    private double growthPercentage;
    private Map<String, Long> byRole; // e.g., {"ADMIN": 2, "USER": 100, "MODERATOR": 5}
}
