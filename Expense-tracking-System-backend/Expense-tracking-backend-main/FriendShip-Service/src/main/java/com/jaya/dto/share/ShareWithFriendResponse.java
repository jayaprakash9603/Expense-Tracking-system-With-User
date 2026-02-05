package com.jaya.dto.share;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareWithFriendResponse {

    private boolean success;
    private String message;
    private Integer friendId;
    private String friendName;
    private String shareUrl;
    private LocalDateTime sharedAt;
    private String notificationId;
}
