package com.jaya.service.processor;

import com.jaya.dto.events.FriendEventDTO;
import com.jaya.modal.Notification;
import com.jaya.repository.NotificationRepository;
import com.jaya.service.NotificationPreferencesChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;
@Component
@Slf4j
public class FriendEventProcessor extends AbstractNotificationEventProcessor<FriendEventDTO> {

    public FriendEventProcessor(NotificationPreferencesChecker preferencesChecker,
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate) {
        super(preferencesChecker, notificationRepository, messagingTemplate);
    }

    @Override
    public String getNotificationType(FriendEventDTO event) {
        switch (event.getAction()) {
            case "REQUEST_SENT":
                return "friendRequestSent";
            case "REQUEST_RECEIVED":
                return "friendRequestReceived";
            case "REQUEST_ACCEPTED":
                return "friendRequestAccepted";
            case "REQUEST_REJECTED":
                return "friendRequestRejected";
            case "FRIEND_REMOVED":
                return "friendRemoved";

            case "FRIEND_REQUEST_SENT":
                return "friendRequestSent";
            case "FRIEND_REQUEST_RECEIVED":
                return "friendRequestReceived";
            case "FRIEND_REQUEST_ACCEPTED":
                return "friendRequestAccepted";
            case "FRIEND_REQUEST_REJECTED":
                return "friendRequestRejected";
            case "FRIEND_REQUEST_CANCELLED":
                return "friendRequestCancelled";
            case "FRIENDSHIP_REMOVED":
                return "friendRemoved";
            case "ACCESS_LEVEL_CHANGED":
                return "accessLevelChanged";
            case "USER_BLOCKED":
                return "userBlocked";
            case "USER_UNBLOCKED":
                return "userUnblocked";
            case "DATA_SHARED":
                return "dataShared";

            default:
                log.warn("Unknown friend event action: {}", event.getAction());
                return "friendRequestReceived";
        }
    }

    @Override
    public Integer getUserId(FriendEventDTO event) {
        return event.getUserId();
    }

    @Override
    protected Notification buildNotification(FriendEventDTO event) {
        String title;
        String message;
        String priority;

        String friendName = event.getActorOrFriendName() != null ? event.getActorOrFriendName() : "A user";

        switch (event.getAction()) {
            case "REQUEST_SENT":
                title = "📤 Friend Request Sent";
                message = String.format("Friend request sent to %s", friendName);
                priority = "LOW";
                break;

            case "REQUEST_RECEIVED":
            case "FRIEND_REQUEST_RECEIVED":
                title = "👋 New Friend Request";
                message = String.format("%s sent you a friend request", friendName);
                priority = "HIGH";
                break;

            case "REQUEST_ACCEPTED":
            case "FRIEND_REQUEST_ACCEPTED":
                title = "✅ Friend Request Accepted";
                message = String.format("%s accepted your friend request", friendName);
                priority = "MEDIUM";
                break;

            case "REQUEST_REJECTED":
            case "FRIEND_REQUEST_REJECTED":
                title = "❌ Friend Request Declined";
                message = String.format("%s declined your friend request", friendName);
                priority = "LOW";
                break;

            case "FRIEND_REQUEST_CANCELLED":
                title = "🚫 Friend Request Cancelled";
                message = String.format("%s cancelled their friend request", friendName);
                priority = "LOW";
                break;

            case "FRIEND_REMOVED":
            case "FRIENDSHIP_REMOVED":
                title = "👋 Friend Removed";
                message = String.format("%s removed you as a friend", friendName);
                priority = "LOW";
                break;

            case "ACCESS_LEVEL_CHANGED":
                title = "🔐 Access Level Changed";
                String oldLevel = event.getOldAccessLevel() != null ? event.getOldAccessLevel() : "NONE";
                String newLevel = event.getNewAccessLevel() != null ? event.getNewAccessLevel() : "NONE";
                message = String.format("%s changed your expense access from %s to %s",
                        friendName, oldLevel, newLevel);
                priority = "MEDIUM";
                break;

            case "USER_BLOCKED":
                title = "🚫 User Blocked";
                message = String.format("You have been blocked by %s", friendName);
                priority = "LOW";
                break;

            case "USER_UNBLOCKED":
                title = "✅ User Unblocked";
                message = String.format("%s unblocked you", friendName);
                priority = "LOW";
                break;

            case "DATA_SHARED":
                title = "📊 Data Shared With You";
                Map<String, Object> meta = event.getMetadataAsMap();
                String shareName = meta != null && meta.get("shareName") != null
                        ? meta.get("shareName").toString()
                        : "Expense Data";
                String resourceCount = meta != null && meta.get("resourceCount") != null
                        ? meta.get("resourceCount").toString()
                        : "some";
                String personalMessage = meta != null && meta.get("personalMessage") != null
                        ? meta.get("personalMessage").toString()
                        : null;
                if (personalMessage != null && !personalMessage.isEmpty()) {
                    message = String.format("%s shared \"%s\" (%s items) with you: \"%s\"",
                            friendName, shareName, resourceCount, personalMessage);
                } else {
                    message = String.format("%s shared \"%s\" (%s items) with you",
                            friendName, shareName, resourceCount);
                }
                priority = "HIGH";
                break;

            default:
                log.warn("Unknown friend event action: {}", event.getAction());
                title = "Friend Activity";
                message = "A friend-related activity occurred";
                priority = "LOW";
        }

        Notification notification = createBaseNotification(
                event.getUserId(),
                getNotificationType(event),
                title,
                message,
                priority);

        notification.setRelatedEntityId(event.getFriendshipId());
        notification.setRelatedEntityType("FRIENDSHIP");

        if ("DATA_SHARED".equals(event.getAction())) {
            Map<String, Object> eventMeta = event.getMetadataAsMap();
            if (eventMeta != null) {
                try {
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    notification.setMetadata(mapper.writeValueAsString(eventMeta));
                    notification.setRelatedEntityType("SHARE");
                } catch (Exception e) {
                    log.error("Failed to serialize DATA_SHARED metadata: {}", e.getMessage());
                }
            }
        }

        return notification;
    }
}
