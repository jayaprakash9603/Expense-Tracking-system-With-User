package com.jaya.kafka.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendshipNotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    public static final String FRIEND_REQUEST_SENT = "FRIEND_REQUEST_SENT";
    public static final String FRIEND_REQUEST_RECEIVED = "FRIEND_REQUEST_RECEIVED";
    public static final String FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED";
    public static final String FRIEND_REQUEST_REJECTED = "FRIEND_REQUEST_REJECTED";
    public static final String FRIEND_REQUEST_CANCELLED = "FRIEND_REQUEST_CANCELLED";
    public static final String FRIENDSHIP_REMOVED = "FRIENDSHIP_REMOVED";
    public static final String ACCESS_LEVEL_CHANGED = "ACCESS_LEVEL_CHANGED";
    public static final String USER_BLOCKED = "USER_BLOCKED";
    public static final String USER_UNBLOCKED = "USER_UNBLOCKED";
    public static final String DATA_SHARED = "DATA_SHARED";

    private Integer friendshipId;
    private Integer userId;
    private Integer actorId;

    private String action;

    private Integer requesterId;
    private Integer recipientId;
    private String friendshipStatus;

    private String requesterAccess;
    private String recipientAccess;
    private String oldAccessLevel;
    private String newAccessLevel;

    private String actorName;
    private String actorEmail;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private Map<String, Object> metadata;

    public void validate() {
        if (friendshipId == null && !DATA_SHARED.equals(action)) {
            throw new IllegalArgumentException("Friendship ID cannot be null");
        }
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (actorId == null) {
            throw new IllegalArgumentException("Actor ID cannot be null");
        }
        if (action == null || action.trim().isEmpty()) {
            throw new IllegalArgumentException("Action cannot be null or empty");
        }
        if (timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public boolean isFriendRequestSent() {
        return FRIEND_REQUEST_SENT.equals(action);
    }

    public boolean isFriendRequestReceived() {
        return FRIEND_REQUEST_RECEIVED.equals(action);
    }

    public boolean isFriendRequestAccepted() {
        return FRIEND_REQUEST_ACCEPTED.equals(action);
    }

    public boolean isFriendRequestRejected() {
        return FRIEND_REQUEST_REJECTED.equals(action);
    }

    public boolean isFriendRequestCancelled() {
        return FRIEND_REQUEST_CANCELLED.equals(action);
    }

    public boolean isFriendshipRemoved() {
        return FRIENDSHIP_REMOVED.equals(action);
    }

    public boolean isAccessLevelChanged() {
        return ACCESS_LEVEL_CHANGED.equals(action);
    }

    public boolean isUserBlocked() {
        return USER_BLOCKED.equals(action);
    }

    public boolean isUserUnblocked() {
        return USER_UNBLOCKED.equals(action);
    }

    public boolean isDataShared() {
        return DATA_SHARED.equals(action);
    }
}
