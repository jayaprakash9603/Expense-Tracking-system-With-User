package com.jaya.dto;

import com.jaya.modal.NotificationPriority;
import com.jaya.modal.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDTO {

    private String title;
    private String message;
    private NotificationType type;
    private NotificationPriority priority = NotificationPriority.MEDIUM;
    private String channel;
    private Map<String, Object> metadata;
    private Boolean sendEmail = false;
    private Boolean sendSms = false;
    private Boolean sendPush = false;
    private Boolean saveInApp = true;
}