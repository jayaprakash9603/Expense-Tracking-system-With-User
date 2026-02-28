package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

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

    private String actionText;

    private String icon;

    private UserInfoDTO actorUser;

    private UserInfoDTO targetUser;

    private Map<String, Object> entityPayload;

    private Map<String, Object> previousEntityState;

    private String actorIpAddress;

    private String actorUserAgent;

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
