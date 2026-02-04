package com.jaya.common.kafka.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
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
import java.util.UUID;

/**
 * Friend Request Event - Used for friend request notifications.
 * Sent when a friend request is created, accepted, or rejected.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FriendRequestEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Unique event ID for correlation
     */
    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    /**
     * Event timestamp
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Event type: FRIEND_REQUEST_SENT, FRIEND_REQUEST_ACCEPTED,
     * FRIEND_REQUEST_REJECTED
     */
    private String eventType;

    /**
     * The friend request ID
     */
    private Long requestId;

    /**
     * User who sent the friend request
     */
    private Integer senderId;
    private String senderUsername;
    private String senderEmail;
    private String senderFullName;
    private String senderImage;

    /**
     * User who received the friend request
     */
    private Integer receiverId;
    private String receiverUsername;
    private String receiverEmail;
    private String receiverFullName;
    private String receiverImage;

    /**
     * Optional message with the friend request
     */
    private String message;

    /**
     * Status of the request
     */
    private String status;

    /**
     * Source service
     */
    @Builder.Default
    private String sourceService = "FRIENDSHIP-SERVICE";

    // Event type constants
    public static class EventType {
        public static final String FRIEND_REQUEST_SENT = "FRIEND_REQUEST_SENT";
        public static final String FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED";
        public static final String FRIEND_REQUEST_REJECTED = "FRIEND_REQUEST_REJECTED";
        public static final String FRIEND_REMOVED = "FRIEND_REMOVED";

        private EventType() {
        }
    }

    // Status constants
    public static class Status {
        public static final String PENDING = "PENDING";
        public static final String ACCEPTED = "ACCEPTED";
        public static final String REJECTED = "REJECTED";

        private Status() {
        }
    }
}
