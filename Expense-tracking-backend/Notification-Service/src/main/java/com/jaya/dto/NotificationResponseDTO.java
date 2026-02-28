package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {

    private boolean success;
    private String message;
    private Integer notificationId;
    private LocalDateTime timestamp;
    private List<String> deliveryChannels;
    private String errorMessage;
    private Map<String, Object> additionalData;
}