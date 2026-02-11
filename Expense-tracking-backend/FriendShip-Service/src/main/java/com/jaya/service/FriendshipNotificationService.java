package com.jaya.service;

import com.jaya.kafka.events.FriendshipNotificationEvent;
import com.jaya.kafka.producer.FriendshipNotificationProducer;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.common.dto.UserDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class FriendshipNotificationService {

    private final FriendshipNotificationProducer producer;

    @Autowired
    public FriendshipNotificationService(FriendshipNotificationProducer producer) {
        this.producer = producer;
    }

    @Async
    public void sendFriendRequestSentNotification(Friendship friendship, UserDTO requester) {
        try {
            log.debug("Preparing friend request received notification for recipient ID: {}",
                    friendship.getRecipientId());

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(friendship.getRecipientId())
                    .actorId(friendship.getRequesterId())
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

    @Async
    public void sendFriendRequestAcceptedNotification(Friendship friendship, UserDTO acceptor) {
        try {
            log.debug("Preparing friend request accepted notification for requester ID: {}",
                    friendship.getRequesterId());

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(friendship.getRequesterId())
                    .actorId(friendship.getRecipientId())
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

    @Async
    public void sendFriendRequestRejectedNotification(Friendship friendship, UserDTO rejector) {
        try {
            log.debug("Preparing friend request rejected notification for requester ID: {}",
                    friendship.getRequesterId());

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(friendship.getRequesterId())
                    .actorId(friendship.getRecipientId())
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

    @Async
    public void sendFriendRequestCancelledNotification(Friendship friendship, UserDTO canceller) {
        try {
            log.debug("Preparing friend request cancelled notification for recipient ID: {}",
                    friendship.getRecipientId());

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(friendship.getRecipientId())
                    .actorId(friendship.getRequesterId())
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

    @Async
    public void sendFriendshipRemovedNotification(Friendship friendship, UserDTO remover, Integer otherId) {
        try {
            log.debug("Preparing friendship removed notification for user ID: {}", otherId);

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(otherId)
                    .actorId(remover.getId())
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

    @Async
    public void sendAccessLevelChangedNotification(Friendship friendship, UserDTO changer,
            Integer otherId, AccessLevel oldAccess,
            AccessLevel newAccess) {
        try {
            log.debug("Preparing access level changed notification for user ID: {}", otherId);

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendship.getId())
                    .userId(otherId)
                    .actorId(changer.getId())
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

    @Async
    public void sendUserBlockedNotification(Integer friendshipId, UserDTO blocker, Integer blockedId) {
        try {
            log.debug("User {} blocked user {}", blocker.getId(), blockedId);

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendshipId)
                    .userId(blockedId)
                    .actorId(blocker.getId())
                    .action(FriendshipNotificationEvent.USER_BLOCKED)
                    .friendshipStatus("BLOCKED")
                    .actorName(getFullName(blocker))
                    .actorEmail(blocker.getEmail())
                    .timestamp(LocalDateTime.now())
                    .metadata(buildBlockedMetadata(blocker, blockedId))
                    .build();

            log.info("User {} blocked user {} (notification not sent)", blocker.getId(), blockedId);

        } catch (Exception e) {
            log.error("Failed to process user blocked notification: {}", e.getMessage(), e);
        }
    }

    @Async
    public void sendUserUnblockedNotification(Integer friendshipId, UserDTO unblocker, Integer unblockedId) {
        try {
            log.debug("User {} unblocked user {}", unblocker.getId(), unblockedId);

            FriendshipNotificationEvent event = FriendshipNotificationEvent.builder()
                    .friendshipId(friendshipId)
                    .userId(unblockedId)
                    .actorId(unblocker.getId())
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

    private Map<String, Object> buildFriendRequestMetadata(Friendship friendship, UserDTO requester) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friend_request");
        metadata.put("requesterName", getFullName(requester));
        metadata.put("requesterEmail", requester.getEmail());
        metadata.put("requesterId", friendship.getRequesterId());
        metadata.put("recipientId", friendship.getRecipientId());
        metadata.put("status", "PENDING");
        return metadata;
    }

    private Map<String, Object> buildAcceptedMetadata(Friendship friendship, UserDTO acceptor) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friend_request_accepted");
        metadata.put("acceptorName", getFullName(acceptor));
        metadata.put("acceptorEmail", acceptor.getEmail());
        metadata.put("requesterAccess", getAccessLevelString(friendship.getRequesterAccess()));
        metadata.put("recipientAccess", getAccessLevelString(friendship.getRecipientAccess()));
        metadata.put("status", "ACCEPTED");
        return metadata;
    }

    private Map<String, Object> buildRejectedMetadata(Friendship friendship, UserDTO rejector) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friend_request_rejected");
        metadata.put("rejectorName", getFullName(rejector));
        metadata.put("rejectorEmail", rejector.getEmail());
        metadata.put("status", "REJECTED");
        return metadata;
    }

    private Map<String, Object> buildCancelledMetadata(Friendship friendship, UserDTO canceller) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friend_request_cancelled");
        metadata.put("cancellerName", getFullName(canceller));
        metadata.put("cancellerEmail", canceller.getEmail());
        metadata.put("status", "CANCELLED");
        return metadata;
    }

    private Map<String, Object> buildRemovedMetadata(Friendship friendship, UserDTO remover) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "friendship_removed");
        metadata.put("removerName", getFullName(remover));
        metadata.put("removerEmail", remover.getEmail());
        metadata.put("removerId", remover.getId());
        return metadata;
    }

    private Map<String, Object> buildAccessChangedMetadata(Friendship friendship, UserDTO changer,
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

    private Map<String, Object> buildBlockedMetadata(UserDTO blocker, Integer blockedId) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "user_blocked");
        metadata.put("blockerName", getFullName(blocker));
        metadata.put("blockerEmail", blocker.getEmail());
        metadata.put("blockerId", blocker.getId());
        metadata.put("blockedId", blockedId);
        return metadata;
    }

    private Map<String, Object> buildUnblockedMetadata(UserDTO unblocker, Integer unblockedId) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("type", "user_unblocked");
        metadata.put("unblockerName", getFullName(unblocker));
        metadata.put("unblockerEmail", unblocker.getEmail());
        metadata.put("unblockerId", unblocker.getId());
        metadata.put("unblockedId", unblockedId);
        return metadata;
    }

    @Async
    public void sendDataSharedNotification(UserDTO sharer, Integer friendId, String shareUrl,
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
                    .friendshipId(null)
                    .userId(friendId)
                    .actorId(sharer.getId())
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

    private String getAccessLevelString(AccessLevel accessLevel) {
        return accessLevel != null ? accessLevel.name() : "NONE";
    }

    private String getFullName(UserDTO user) {
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

        if (fullName.trim().isEmpty() && user.getUsername() != null) {
            fullName = user.getUsername();
        }

        return fullName.trim().isEmpty() ? "User #" + user.getId() : fullName.trim();
    }
}
