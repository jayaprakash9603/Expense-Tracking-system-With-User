package com.jaya.service;

import com.jaya.kafka.events.FriendshipNotificationEvent;
import com.jaya.kafka.producer.FriendshipNotificationProducer;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.UserDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * FriendshipNotificationService
 * Service layer for sending friendship-related notifications
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles friendship notification business logic
 * - Dependency Inversion: Depends on FriendshipNotificationProducer abstraction
 * 
 * DRY Principle:
 * - Common event building logic extracted to helper methods
 * - Reuses producer infrastructure
 * 
 * All methods are @Async to avoid blocking the main business logic
 * 
 * @author Friendship Service Team
 */
@Slf4j
@Service
public class FriendshipNotificationService {

    private final FriendshipNotificationProducer producer;

    @Autowired
    public FriendshipNotificationService(FriendshipNotificationProducer producer) {
        this.producer = producer;
    }

    /**
     * Send notification when a friend request is sent
     * Notifies the RECIPIENT that they received a friend request
     * 
     * @param friendship The friendship entity
     * @param requester  The user who sent the request
     */
    @Async
    public void sendFriendRequestSentNotification(Friendship friendship, UserDto requester) {
        try {
            log.debug("Preparing friend request received notification for recipient ID: {}",
                    friendship.getRecipientId());

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(friendship.getRecipientId()) // Recipient receives notification
                    .actorId(friendship.getRequesterId()) // Requester is the actor
                    .action(FriendshipNotificationEvent.FRIEND_REQUEST_RECEIVED)
                    .requesterId(friendship.getRequesterId())
                    .recipientId(friendship.getRecipientId())
                    .friendshipStatus(FriendshipStatus.PENDING.name())
                    .actorName(getFullName(requester))
                    .actorEmail(requester.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildFriendRequestMetadata(friendship, requester))
                    .build();

            producer.sendEvent(event);
            log.info("Friend request notification sent to user {} from user {}",
                    friendship.getRecipientId(), getFullName(requester));

        } catch (Exception e) {
            log.error("Failed to send friend request notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend request is accepted
     * Notifies the REQUESTER that their friend request was accepted
     * 
     * @param friendship The friendship entity
     * @param acceptor   The user who accepted the request (recipient)
     */
    @Async
    public void sendFriendRequestAcceptedNotification(Friendship friendship, UserDto acceptor) {
        try {
            log.debug("Preparing friend request accepted notification for requester ID: {}",
                    friendship.getRequesterId());

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(friendship.getRequesterId()) // Requester receives notification
                    .actorId(friendship.getRecipientId()) // Recipient (acceptor) is the actor
                    .action(FriendshipNotificationEvent.FRIEND_REQUEST_ACCEPTED)
                    .requesterId(friendship.getRequesterId())
                    .recipientId(friendship.getRecipientId())
                    .friendshipStatus(FriendshipStatus.ACCEPTED.name())
                    .requesterAccess(getAccessLevelString(friendship.getRequesterAccess()))
                    .recipientAccess(getAccessLevelString(friendship.getRecipientAccess()))
                    .actorName(getFullName(acceptor))
                    .actorEmail(acceptor.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildAcceptedMetadata(friendship, acceptor))
                    .build();

            producer.sendEvent(event);
            log.info("Friend request accepted notification sent to user {} from user {}",
                    friendship.getRequesterId(), getFullName(acceptor));

        } catch (Exception e) {
            log.error("Failed to send friend request accepted notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend request is rejected
     * Notifies the REQUESTER that their friend request was rejected
     * 
     * @param friendship The friendship entity
     * @param rejector   The user who rejected the request (recipient)
     */
    @Async
    public void sendFriendRequestRejectedNotification(Friendship friendship, UserDto rejector) {
        try {
            log.debug("Preparing friend request rejected notification for requester ID: {}",
                    friendship.getRequesterId());

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(friendship.getRequesterId()) // Requester receives notification
                    .actorId(friendship.getRecipientId()) // Recipient (rejector) is the actor
                    .action(FriendshipNotificationEvent.FRIEND_REQUEST_REJECTED)
                    .requesterId(friendship.getRequesterId())
                    .recipientId(friendship.getRecipientId())
                    .friendshipStatus(FriendshipStatus.REJECTED.name())
                    .actorName(getFullName(rejector))
                    .actorEmail(rejector.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildRejectedMetadata(friendship, rejector))
                    .build();

            producer.sendEvent(event);
            log.info("Friend request rejected notification sent to user {} from user {}",
                    friendship.getRequesterId(), getFullName(rejector));

        } catch (Exception e) {
            log.error("Failed to send friend request rejected notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend request is cancelled
     * Notifies the RECIPIENT that the requester cancelled their friend request
     * 
     * @param friendship The friendship entity
     * @param canceller  The user who cancelled the request (requester)
     */
    @Async
    public void sendFriendRequestCancelledNotification(Friendship friendship, UserDto canceller) {
        try {
            log.debug("Preparing friend request cancelled notification for recipient ID: {}",
                    friendship.getRecipientId());

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(friendship.getRecipientId()) // Recipient receives notification
                    .actorId(friendship.getRequesterId()) // Requester (canceller) is the actor
                    .action(FriendshipNotificationEvent.FRIEND_REQUEST_CANCELLED)
                    .requesterId(friendship.getRequesterId())
                    .recipientId(friendship.getRecipientId())
                    .friendshipStatus(FriendshipStatus.PENDING.name())
                    .actorName(getFullName(canceller))
                    .actorEmail(canceller.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildCancelledMetadata(friendship, canceller))
                    .build();

            producer.sendEvent(event);
            log.info("Friend request cancelled notification sent to user {} from user {}",
                    friendship.getRecipientId(), getFullName(canceller));

        } catch (Exception e) {
            log.error("Failed to send friend request cancelled notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friendship is removed
     * Notifies the OTHER user that the friendship was terminated
     * 
     * @param friendship The friendship entity
     * @param remover    The user who removed the friendship
     * @param otherId    The other user's ID (who receives notification)
     */
    @Async
    public void sendFriendshipRemovedNotification(Friendship friendship, UserDto remover, Integer otherId) {
        try {
            log.debug("Preparing friendship removed notification for user ID: {}", otherId);

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(otherId) // Other user receives notification
                    .actorId(remover.getId()) // Remover is the actor
                    .action(FriendshipNotificationEvent.FRIENDSHIP_REMOVED)
                    .requesterId(friendship.getRequesterId())
                    .recipientId(friendship.getRecipientId())
                    .friendshipStatus(FriendshipStatus.ACCEPTED.name())
                    .actorName(getFullName(remover))
                    .actorEmail(remover.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildRemovedMetadata(friendship, remover))
                    .build();

            producer.sendEvent(event);
            log.info("Friendship removed notification sent to user {} from user {}",
                    otherId, getFullName(remover));

        } catch (Exception e) {
            log.error("Failed to send friendship removed notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when access level is changed
     * Notifies the OTHER user that their access level was modified
     * 
     * @param friendship The friendship entity
     * @param changer    The user who changed the access level
     * @param otherId    The other user's ID (who receives notification)
     * @param oldAccess  Previous access level
     * @param newAccess  New access level
     */
    @Async
    public void sendAccessLevelChangedNotification(Friendship friendship, UserDto changer,
            Integer otherId, AccessLevel oldAccess,
            AccessLevel newAccess) {
        try {
            log.debug("Preparing access level changed notification for user ID: {}", otherId);

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(otherId) // Other user receives notification
                    .actorId(changer.getId()) // Changer is the actor
                    .action(FriendshipNotificationEvent.ACCESS_LEVEL_CHANGED)
                    .requesterId(friendship.getRequesterId())
                    .recipientId(friendship.getRecipientId())
                    .friendshipStatus(FriendshipStatus.ACCEPTED.name())
                    .oldAccessLevel(getAccessLevelString(oldAccess))
                    .newAccessLevel(getAccessLevelString(newAccess))
                    .requesterAccess(getAccessLevelString(friendship.getRequesterAccess()))
                    .recipientAccess(getAccessLevelString(friendship.getRecipientAccess()))
                    .actorName(getFullName(changer))
                    .actorEmail(changer.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildAccessChangedMetadata(friendship, changer, oldAccess, newAccess))
                    .build();

            producer.sendEvent(event);
            log.info("Access level changed notification sent to user {} from user {} (Old: {}, New: {})",
                    otherId, getFullName(changer), oldAccess, newAccess);

        } catch (Exception e) {
            log.error("Failed to send access level changed notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a user is blocked
     * Note: Typically, we might NOT notify the blocked user for privacy reasons
     * This method is here for completeness but may not be used
     * 
     * @param friendshipId The friendship ID (if exists)
     * @param blocker      The user who blocked
     * @param blockedId    The blocked user's ID
     */
    @Async
    public void sendUserBlockedNotification(Integer friendshipId, UserDto blocker, Integer blockedId) {
        try {
            log.debug("User {} blocked user {}", blocker.getId(), blockedId);

            // Typically we don't notify blocked users for privacy/security
            // This method exists for system logging or admin purposes

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendshipId)
                    .userId(blockedId) // Blocked user (may not receive)
                    .actorId(blocker.getId()) // Blocker is the actor
                    .action(FriendshipNotificationEvent.USER_BLOCKED)
                    .friendshipStatus("BLOCKED")
                    .actorName(getFullName(blocker))
                    .actorEmail(blocker.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildBlockedMetadata(blocker, blockedId))
                    .build();

            // Note: May want to skip sending this to the user
            // producer.sendEvent(event);
            log.info("User {} blocked user {} (notification not sent)", blocker.getId(), blockedId);

        } catch (Exception e) {
            log.error("Failed to process user blocked notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a user is unblocked
     * 
     * @param friendshipId The friendship ID (if exists)
     * @param unblocker    The user who unblocked
     * @param unblockedId  The unblocked user's ID
     */
    @Async
    public void sendUserUnblockedNotification(Integer friendshipId, UserDto unblocker, Integer unblockedId) {
        try {
            log.debug("User {} unblocked user {}", unblocker.getId(), unblockedId);

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendshipId)
                    .userId(unblockedId) // Unblocked user receives notification
                    .actorId(unblocker.getId()) // Unblocker is the actor
                    .action(FriendshipNotificationEvent.USER_UNBLOCKED)
                    .friendshipStatus("UNBLOCKED")
                    .actorName(getFullName(unblocker))
                    .actorEmail(unblocker.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildUnblockedMetadata(unblocker, unblockedId))
                    .build();

            producer.sendEvent(event);
            log.info("User unblocked notification sent to user {} from user {}",
                    unblockedId, getFullName(unblocker));

        } catch (Exception e) {
            log.error("Failed to send user unblocked notification: {}", e.getMessage(), e);
        }
    }

    // ========== Helper Methods ==========

    /**
     * Build metadata for friend request
     */
    private Map<String, Object> buildFriendRequestMetadata(Friendship friendship, UserDto requester) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friend_request");
        metadata.put("requesterName", getFullName(requester));
        metadata.put("requesterEmail", requester.getEmail());
        metadata.put("requesterId", friendship.getRequesterId());
        metadata.put("recipientId", friendship.getRecipientId());
        metadata.put("status", "PENDING");
        return metadata;
    }

    /**
     * Build metadata for accepted friend request
     */
    private Map<String, Object> buildAcceptedMetadata(Friendship friendship, UserDto acceptor) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friend_request_accepted");
        metadata.put("acceptorName", getFullName(acceptor));
        metadata.put("acceptorEmail", acceptor.getEmail());
        metadata.put("requesterAccess", getAccessLevelString(friendship.getRequesterAccess()));
        metadata.put("recipientAccess", getAccessLevelString(friendship.getRecipientAccess()));
        metadata.put("status", "ACCEPTED");
        return metadata;
    }

    /**
     * Build metadata for rejected friend request
     */
    private Map<String, Object> buildRejectedMetadata(Friendship friendship, UserDto rejector) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friend_request_rejected");
        metadata.put("rejectorName", getFullName(rejector));
        metadata.put("rejectorEmail", rejector.getEmail());
        metadata.put("status", "REJECTED");
        return metadata;
    }

    /**
     * Build metadata for cancelled friend request
     */
    private Map<String, Object> buildCancelledMetadata(Friendship friendship, UserDto canceller) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friend_request_cancelled");
        metadata.put("cancellerName", getFullName(canceller));
        metadata.put("cancellerEmail", canceller.getEmail());
        metadata.put("status", "CANCELLED");
        return metadata;
    }

    /**
     * Build metadata for removed friendship
     */
    private Map<String, Object> buildRemovedMetadata(Friendship friendship, UserDto remover) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friendship_removed");
        metadata.put("removerName", getFullName(remover));
        metadata.put("removerEmail", remover.getEmail());
        metadata.put("removerId", remover.getId());
        return metadata;
    }

    /**
     * Build metadata for access level change
     */
    private Map<String, Object> buildAccessChangedMetadata(Friendship friendship, UserDto changer,
            AccessLevel oldAccess, AccessLevel newAccess) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "access_level_changed");
        metadata.put("changerName", getFullName(changer));
        metadata.put("changerEmail", changer.getEmail());
        metadata.put("oldAccessLevel", getAccessLevelString(oldAccess));
        metadata.put("newAccessLevel", getAccessLevelString(newAccess));
        metadata.put("requesterAccess", getAccessLevelString(friendship.getRequesterAccess()));
        metadata.put("recipientAccess", getAccessLevelString(friendship.getRecipientAccess()));
        return metadata;
    }

    /**
     * Build metadata for blocked user
     */
    private Map<String, Object> buildBlockedMetadata(UserDto blocker, Integer blockedId) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "user_blocked");
        metadata.put("blockerName", getFullName(blocker));
        metadata.put("blockerEmail", blocker.getEmail());
        metadata.put("blockerId", blocker.getId());
        metadata.put("blockedId", blockedId);
        return metadata;
    }

    /**
     * Build metadata for unblocked user
     */
    private Map<String, Object> buildUnblockedMetadata(UserDto unblocker, Integer unblockedId) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "user_unblocked");
        metadata.put("unblockerName", getFullName(unblocker));
        metadata.put("unblockerEmail", unblocker.getEmail());
        metadata.put("unblockerId", unblocker.getId());
        metadata.put("unblockedId", unblockedId);
        return metadata;
    }

    /**
     * Send notification when a user shares data with a friend
     * Notifies the FRIEND that they received shared data
     * 
     * @param sharer        The user who is sharing data
     * @param friendId      The friend who will receive the notification
     * @param shareUrl      The URL to access the shared data
     * @param shareName     The name/description of the share
     * @param resourceCount Number of resources being shared
     * @param message       Optional personal message from the sharer
     */
    @Async
    public void sendDataSharedNotification(UserDto sharer, Integer friendId, String shareUrl,
            String shareName, int resourceCount, String message) {
        try {
            log.debug("Preparing data shared notification for friend ID: {}", friendId);

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("type", "data_shared");
            metadata.put("shareUrl", shareUrl);
            metadata.put("shareName", shareName);
            metadata.put("resourceCount", resourceCount);
            metadata.put("sharerName", getFullName(sharer));
            metadata.put("sharerEmail", sharer.getEmail());
            if (message != null && !message.trim().isEmpty()) {
                metadata.put("personalMessage", message);
            }

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(null) // No friendship ID for data sharing
                    .userId(friendId) // Friend receives notification
                    .actorId(sharer.getId()) // Sharer is the actor
                    .action(FriendshipNotificationEvent.DATA_SHARED)
                    .requesterId(sharer.getId())
                    .recipientId(friendId)
                    .actorName(getFullName(sharer))
                    .actorEmail(sharer.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(metadata)
                    .build();

            producer.sendEvent(event);
            log.info("Data shared notification sent to friend {} from user {}",
                    friendId, getFullName(sharer));

        } catch (Exception e) {
            log.error("Failed to send data shared notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Safely convert AccessLevel to String
     */
    private String getAccessLevelString(AccessLevel accessLevel) {
        return accessLevel != null ? accessLevel.name() : "NONE";
    }

    /**
     * Get full name from UserDto
     * Combines firstName and lastName, fallback to username
     */
    private String getFullName(UserDto user) {
        if (user == null) {
            return "Unknown User";
        }

        String fullName = "";
        if (user.getFirstName() != null && !user.getFirstName().trim().isEmpty()) {
            fullName = user.getFirstName();
        }
        if (user.getLastName() != null && !user.getLastName().trim().isEmpty()) {
            fullName = fullName.isEmpty() ? user.getLastName() : fullName + " " + user.getLastName();
        }

        // Fallback to username if no name is set
        if (fullName.trim().isEmpty() && user.getUsername() != null) {
            fullName = user.getUsername();
        }

        return fullName.trim().isEmpty() ? "User #" + user.getId() : fullName.trim();
    }
}
