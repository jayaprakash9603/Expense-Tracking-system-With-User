package com.jaya.service.processor;

import com.jaya.dto.events.FriendEventDTO;
import com.jaya.modal.Notification;
import com.jaya.repository.NotificationRepository;
import com.jaya.service.NotificationPreferencesChecker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Processor for Friend events
 * Follows Single Responsibility Principle - only handles friend/friendship
 * notifications
 */
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
            default:
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

        String friendName = event.getFriendName() != null ? event.getFriendName() : "A user";

        switch (event.getAction()) {
            case "REQUEST_SENT":
                title = "📤 Friend Request Sent";
                message = String.format("Friend request sent to %s", friendName);
                priority = "LOW";
                break;

            case "REQUEST_RECEIVED":
                title = "👋 New Friend Request";
                message = String.format("%s sent you a friend request", friendName);
                priority = "HIGH";
                break;

            case "REQUEST_ACCEPTED":
                title = "✅ Friend Request Accepted";
                message = String.format("%s accepted your friend request", friendName);
                priority = "MEDIUM";
                break;

            case "REQUEST_REJECTED":
                title = "❌ Friend Request Declined";
                message = String.format("%s declined your friend request", friendName);
                priority = "LOW";
                break;

            case "FRIEND_REMOVED":
                title = "👋 Friend Removed";
                message = String.format("You are no longer friends with %s", friendName);
                priority = "LOW";
                break;

            default:
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

        return notification;
    }
}
