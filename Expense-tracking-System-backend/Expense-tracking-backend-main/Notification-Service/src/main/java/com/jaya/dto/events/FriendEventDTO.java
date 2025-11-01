package com.jaya.dto.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Event DTO for Friend/Friendship-related events from Friendship-Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer friendshipId;
    private Integer userId; // The user who will receive the notification
    private Integer friendId; // The friend involved in the action
    private String action; // REQUEST_SENT, REQUEST_RECEIVED, REQUEST_ACCEPTED, REQUEST_REJECTED,
                           // FRIEND_REMOVED
    private String friendName;
    private String friendEmail;
    private String friendProfileImage;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    private String metadata;
}
