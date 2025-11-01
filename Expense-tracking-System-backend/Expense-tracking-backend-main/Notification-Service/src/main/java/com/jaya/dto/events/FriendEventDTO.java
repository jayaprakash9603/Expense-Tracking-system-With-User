package com.jaya.dto.events;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
import java.util.Map;

/**
 * Event DTO for Friend/Friendship-related events from Friendship-Service
 * Updated to support new FriendshipNotificationEvent structure
 * 
 * Backward compatible with old friend request events
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class FriendEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    // Core Identifiers
    private Integer friendshipId;
    private Integer userId; // The user who will receive the notification

    // Actor Information (new format)
    private Integer actorId; // The user who performed the action
    private String actorName; // Name of the actor
    private String actorEmail; // Email of the actor

    // Legacy fields (for backward compatibility)
    @JsonAlias("friendId")
    private Integer friendId; // Alias for actorId in old format

    @JsonAlias("friendName")
    private String friendName; // Alias for actorName in old format

    @JsonAlias("friendEmail")
    private String friendEmail; // Alias for actorEmail in old format

    @JsonAlias("friendProfileImage")
    private String friendProfileImage; // Profile image (if available)

    // Action and Status
    private String action; // Action type (e.g., FRIEND_REQUEST_RECEIVED, etc.)
    private Integer requesterId; // Original requester
    private Integer recipientId; // Original recipient
    private String friendshipStatus; // PENDING, ACCEPTED, REJECTED, BLOCKED

    // Access Level Information (for expense sharing)
    private String requesterAccess; // Access level given by recipient to requester
    private String recipientAccess; // Access level given by requester to recipient
    private String oldAccessLevel; // Previous access level (for ACCESS_LEVEL_CHANGED)
    private String newAccessLevel; // New access level (for ACCESS_LEVEL_CHANGED)

    // Timestamp
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    // Metadata - now supports both String and Map for flexibility
    private Object metadata;

    /**
     * Get metadata as Map if it's a Map, otherwise return null
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getMetadataAsMap() {
        if (metadata instanceof Map) {
            return (Map<String, Object>) metadata;
        }
        return null;
    }

    /**
     * Get metadata as String if it's a String, otherwise return null
     */
    public String getMetadataAsString() {
        if (metadata instanceof String) {
            return (String) metadata;
        }
        return null;
    }

    /**
     * Get the actor/friend ID (supports both new and old format)
     */
    public Integer getActorOrFriendId() {
        return actorId != null ? actorId : friendId;
    }

    /**
     * Get the actor/friend name (supports both new and old format)
     */
    public String getActorOrFriendName() {
        return actorName != null ? actorName : friendName;
    }

    /**
     * Get the actor/friend email (supports both new and old format)
     */
    public String getActorOrFriendEmail() {
        return actorEmail != null ? actorEmail : friendEmail;
    }
}
