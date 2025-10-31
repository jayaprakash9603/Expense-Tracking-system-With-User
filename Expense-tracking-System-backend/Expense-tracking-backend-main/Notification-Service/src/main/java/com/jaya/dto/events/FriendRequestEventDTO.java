package com.jaya.dto.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event DTO for Friend Request notifications
 * Received from FriendShip-Service via Kafka
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestEventDTO {
    
    private Long eventId;
    private String eventType; // FRIEND_REQUEST_SENT, FRIEND_REQUEST_ACCEPTED, FRIEND_REQUEST_REJECTED
    private Integer friendshipId;
    private Integer requesterId;
    private String requesterName;
    private String requesterEmail;
    private String requesterImage;
    private Integer recipientId;
    private String recipientName;
    private String recipientEmail;
    private String recipientImage;
    private String friendshipStatus; // PENDING, ACCEPTED, REJECTED
    private LocalDateTime timestamp;
    private String message;
    
    // Metadata
    private String source; // "FRIENDSHIP_SERVICE"
    private Integer notificationPriority; // 1=HIGH, 2=MEDIUM, 3=LOW
}
