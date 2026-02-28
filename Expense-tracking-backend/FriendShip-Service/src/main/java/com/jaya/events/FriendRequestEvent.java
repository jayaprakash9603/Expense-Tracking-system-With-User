package com.jaya.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestEvent {

    private Long eventId;
    private String eventType;
    private Integer friendshipId;
    private Integer requesterId;
    private String requesterName;
    private String requesterEmail;
    private String requesterImage;
    private Integer recipientId;
    private String recipientName;
    private String recipientEmail;
    private String recipientImage;
    private String friendshipStatus;
    private LocalDateTime timestamp;
    private String message;

    private String source;
    private Integer notificationPriority;
}
