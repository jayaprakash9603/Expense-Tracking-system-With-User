package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for friend activity responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendActivityDTO {

    private Long id;
    private Integer targetUserId;
    private Integer actorUserId;
    private String actorUserName;
    private String sourceService;
    private String entityType;
    private Integer entityId;
    private String action;
    private String description;
    private Double amount;
    private String metadata;
    private LocalDateTime timestamp;
    private Boolean isRead;
    private LocalDateTime createdAt;

    /**
     * User-friendly action text for display.
     */
    private String actionText;

    /**
     * Icon suggestion based on action type.
     */
    private String icon;
}
