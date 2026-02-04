package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for Friendship Report Preference
 * Used for API communication of layout preferences
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipReportPreferenceDTO {

    private Long id;
    private Integer userId;
    private String layoutConfig;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
