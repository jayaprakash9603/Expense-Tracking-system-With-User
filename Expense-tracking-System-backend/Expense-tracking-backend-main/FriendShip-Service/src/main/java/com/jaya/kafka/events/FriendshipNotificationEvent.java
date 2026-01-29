package com.jaya.kafka.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * FriendshipNotificationEvent
 * Event DTO for friendship-related notifications sent to Kafka
 * Follows DRY principle by reusing common event structure
 * 
 * Notification Types:
 * - FRIEND_REQUEST_SENT: When a user sends a friend request
 * - FRIEND_REQUEST_RECEIVED: When a user receives a friend request
 * - FRIEND_REQUEST_ACCEPTED: When a friend request is accepted
 * - FRIEND_REQUEST_REJECTED: When a friend request is rejected
 * - FRIEND_REQUEST_CANCELLED: When requester cancels their friend request
 * - FRIENDSHIP_REMOVED: When friendship is terminated
 * - ACCESS_LEVEL_CHANGED: When expense sharing access is modified
 * - USER_BLOCKED: When a user blocks another user
 * - USER_UNBLOCKED: When a user unblocks another user
 * 
 * @author Friendship Service Team
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendshipNotificationEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    // Action Constants
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

    // Core Identifiers
    private Integer friendshipId;
    private Integer userId; // The user who will receive this notification
    private Integer actorId; // The user who performed the action

    // Action Type
    private String action;

    // Friendship Details
    private Integer requesterId; // Original requester
    private Integer recipientId; // Original recipient
    private String friendshipStatus; // PENDING, ACCEPTED, REJECTED, BLOCKED

    // Access Level Information (for expense sharing)
    private String requesterAccess; // Access level given by recipient to requester
    private String recipientAccess; // Access level given by requester to recipient
    private String oldAccessLevel; // Previous access level (for ACCESS_LEVEL_CHANGED)
    private String newAccessLevel; // New access level (for ACCESS_LEVEL_CHANGED)

    // User Information (for display)
    private String actorName; // Name of the user who performed action
    private String actorEmail; // Email of the user who performed action

    // Timestamp
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    // Additional metadata (optional)
    private Map<String, Object> metadata;

    /**
     * Validate the event has required fields.
     * Note: friendshipId can be null for DATA_SHARED events (no friendship
     * required).
     */
    public void validate() {
        // friendshipId can be null for DATA_SHARED events
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

    /**
     * Check if this is a FRIEND_REQUEST_SENT action
     */
    public boolean isFriendRequestSent() {
        return FRIEND_REQUEST_SENT.equals(action);
    }

    /**
     * Check if this is a FRIEND_REQUEST_RECEIVED action
     */
    public boolean isFriendRequestReceived() {
        return FRIEND_REQUEST_RECEIVED.equals(action);
    }

    /**
     * Check if this is a FRIEND_REQUEST_ACCEPTED action
     */
    public boolean isFriendRequestAccepted() {
        return FRIEND_REQUEST_ACCEPTED.equals(action);
    }

    /**
     * Check if this is a FRIEND_REQUEST_REJECTED action
     */
    public boolean isFriendRequestRejected() {
        return FRIEND_REQUEST_REJECTED.equals(action);
    }

    /**
     * Check if this is a FRIEND_REQUEST_CANCELLED action
     */
    public boolean isFriendRequestCancelled() {
        return FRIEND_REQUEST_CANCELLED.equals(action);
    }

    /**
     * Check if this is a FRIENDSHIP_REMOVED action
     */
    public boolean isFriendshipRemoved() {
        return FRIENDSHIP_REMOVED.equals(action);
    }

    /**
     * Check if this is an ACCESS_LEVEL_CHANGED action
     */
    public boolean isAccessLevelChanged() {
        return ACCESS_LEVEL_CHANGED.equals(action);
    }

    /**
     * Check if this is a USER_BLOCKED action
     */
    public boolean isUserBlocked() {
        return USER_BLOCKED.equals(action);
    }

    /**
     * Check if this is a USER_UNBLOCKED action
     */
    public boolean isUserUnblocked() {
        return USER_UNBLOCKED.equals(action);
    }

    /**
     * Check if this is a DATA_SHARED action
     */
    public boolean isDataShared() {
        return DATA_SHARED.equals(action);
    }
}
