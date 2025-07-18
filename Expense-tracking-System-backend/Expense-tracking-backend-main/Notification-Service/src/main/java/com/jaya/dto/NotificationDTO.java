package com.jaya.dto;

import com.jaya.modal.NotificationPriority;
import com.jaya.modal.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private Integer id;
    private Integer userId;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationPriority priority;
    private Boolean isRead = false;
    private Boolean isSent = false;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private String channel;
    private Map<String, Object> metadata;
    private String actionUrl;
    private String iconType;
}