package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

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

    // ==================== NEW FIELDS ====================

    /**
     * Complete actor user information.
     */
    private UserInfoDTO actorUser;

    /**
     * Complete target user information.
     */
    private UserInfoDTO targetUser;

    /**
     * Complete entity payload data.
     */
    private Map<String, Object> entityPayload;

    /**
     * Previous entity state (for updates/deletes).
     */
    private Map<String, Object> previousEntityState;

    /**
     * IP address of the actor for audit purposes.
     */
    private String actorIpAddress;

    /**
     * User agent of the actor for audit purposes.
     */
    private String actorUserAgent;

    /**
     * Inner class for user information.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfoDTO {
        private Integer id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String displayName;
        private String image;
        private String coverImage;
        private String phoneNumber;
        private String location;
        private String bio;
    }
}
