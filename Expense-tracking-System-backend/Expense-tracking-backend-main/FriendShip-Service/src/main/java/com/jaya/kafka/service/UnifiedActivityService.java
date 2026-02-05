package com.jaya.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.UnifiedActivityEvent;
import com.jaya.kafka.producer.UnifiedActivityEventProducer;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UnifiedActivityService {

    private final UnifiedActivityEventProducer producer;
    private final ObjectMapper objectMapper;

    @Async("friendActivityExecutor")
    public void sendFriendRequestSentEvent(Friendship friendship, UserDto requester, UserDto recipient) {
        try {
            log.debug("Sending friend request sent event: requester={}, recipient={}",
                    requester.getId(), recipient.getId());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .actorUserId(requester.getId())
                    .actorUserName(getDisplayName(requester))
                    .actorEmail(requester.getEmail())
                    .actorUser(buildUserInfo(requester))
                    .targetUserId(recipient.getId())
                    .targetUserName(getDisplayName(recipient))
                    .targetUser(buildUserInfo(recipient))
                    .entityType(UnifiedActivityEvent.EntityType.FRIENDSHIP)
                    .entityId(friendship.getId().longValue())
                    .entityName("Friend Request")
                    .action(UnifiedActivityEvent.Action.FRIEND_REQUEST_RECEIVED)
                    .description(String.format("%s sent you a friend request", getDisplayName(requester)))
                    .entityPayload(buildFriendshipPayload(friendship))
                    .metadata(buildFriendRequestMetadata(friendship, requester))
                    .isOwnAction(false)
                    .isFriendActivity(true)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .build();

            producer.sendEvent(event);
            log.info("Friend request sent event published: {} -> {}", requester.getId(), recipient.getId());

        } catch (Exception e) {
            log.error("Failed to send friend request sent event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendFriendRequestAcceptedEvent(Friendship friendship, UserDto requester, UserDto acceptor) {
        try {
            log.debug("Sending friend request accepted event: requester={}, acceptor={}",
                    requester.getId(), acceptor.getId());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .actorUserId(acceptor.getId())
                    .actorUserName(getDisplayName(acceptor))
                    .actorEmail(acceptor.getEmail())
                    .actorUser(buildUserInfo(acceptor))
                    .targetUserId(requester.getId())
                    .targetUserName(getDisplayName(requester))
                    .targetUser(buildUserInfo(requester))
                    .entityType(UnifiedActivityEvent.EntityType.FRIENDSHIP)
                    .entityId(friendship.getId().longValue())
                    .entityName("Friend Request")
                    .action(UnifiedActivityEvent.Action.FRIEND_REQUEST_ACCEPTED)
                    .description(String.format("%s accepted your friend request", getDisplayName(acceptor)))
                    .entityPayload(buildFriendshipPayload(friendship))
                    .metadata(buildFriendshipStatusMetadata(friendship, acceptor, FriendshipStatus.ACCEPTED))
                    .isOwnAction(false)
                    .isFriendActivity(true)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .build();

            producer.sendEvent(event);
            log.info("Friend request accepted event published: {} accepted by {}", requester.getId(), acceptor.getId());

        } catch (Exception e) {
            log.error("Failed to send friend request accepted event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendFriendRequestRejectedEvent(Friendship friendship, UserDto requester, UserDto rejector) {
        try {
            log.debug("Sending friend request rejected event: requester={}, rejector={}",
                    requester.getId(), rejector.getId());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .actorUserId(rejector.getId())
                    .actorUserName(getDisplayName(rejector))
                    .actorEmail(rejector.getEmail())
                    .actorUser(buildUserInfo(rejector))
                    .targetUserId(requester.getId())
                    .targetUserName(getDisplayName(requester))
                    .targetUser(buildUserInfo(requester))
                    .entityType(UnifiedActivityEvent.EntityType.FRIENDSHIP)
                    .entityId(friendship.getId().longValue())
                    .entityName("Friend Request")
                    .action(UnifiedActivityEvent.Action.FRIEND_REQUEST_REJECTED)
                    .description(String.format("%s declined your friend request", getDisplayName(rejector)))
                    .entityPayload(buildFriendshipPayload(friendship))
                    .metadata(buildFriendshipStatusMetadata(friendship, rejector, FriendshipStatus.REJECTED))
                    .isOwnAction(false)
                    .isFriendActivity(true)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .build();

            producer.sendEvent(event);
            log.info("Friend request rejected event published: {} rejected by {}", requester.getId(), rejector.getId());

        } catch (Exception e) {
            log.error("Failed to send friend request rejected event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendFriendRequestCancelledEvent(Friendship friendship, UserDto canceller, UserDto recipient) {
        try {
            log.debug("Sending friend request cancelled event: canceller={}, recipient={}",
                    canceller.getId(), recipient.getId());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .actorUserId(canceller.getId())
                    .actorUserName(getDisplayName(canceller))
                    .actorEmail(canceller.getEmail())
                    .actorUser(buildUserInfo(canceller))
                    .targetUserId(recipient.getId())
                    .targetUserName(getDisplayName(recipient))
                    .targetUser(buildUserInfo(recipient))
                    .entityType(UnifiedActivityEvent.EntityType.FRIENDSHIP)
                    .entityId(friendship.getId().longValue())
                    .entityName("Friend Request")
                    .action(UnifiedActivityEvent.Action.FRIEND_REQUEST_CANCELLED)
                    .description(String.format("%s cancelled their friend request", getDisplayName(canceller)))
                    .entityPayload(buildFriendshipPayload(friendship))
                    .metadata(buildFriendshipStatusMetadata(friendship, canceller, FriendshipStatus.PENDING))
                    .isOwnAction(false)
                    .isFriendActivity(true)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .build();

            producer.sendEvent(event);
            log.info("Friend request cancelled event published: {} cancelled request to {}", canceller.getId(),
                    recipient.getId());

        } catch (Exception e) {
            log.error("Failed to send friend request cancelled event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendFriendRemovedEvent(Friendship friendship, UserDto remover, UserDto removedUser) {
        try {
            log.debug("Sending friend removed event: remover={}, removed={}",
                    remover.getId(), removedUser.getId());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .actorUserId(remover.getId())
                    .actorUserName(getDisplayName(remover))
                    .actorEmail(remover.getEmail())
                    .actorUser(buildUserInfo(remover))
                    .targetUserId(removedUser.getId())
                    .targetUserName(getDisplayName(removedUser))
                    .targetUser(buildUserInfo(removedUser))
                    .entityType(UnifiedActivityEvent.EntityType.FRIENDSHIP)
                    .entityId(friendship.getId().longValue())
                    .entityName("Friendship")
                    .action(UnifiedActivityEvent.Action.FRIEND_REMOVED)
                    .description(String.format("%s removed you from their friends", getDisplayName(remover)))
                    .entityPayload(buildFriendshipPayload(friendship))
                    .metadata(buildFriendRemovedMetadata(friendship, remover))
                    .isOwnAction(false)
                    .isFriendActivity(true)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .build();

            producer.sendEvent(event);
            log.info("Friend removed event published: {} removed {}", remover.getId(), removedUser.getId());

        } catch (Exception e) {
            log.error("Failed to send friend removed event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendAccessLevelChangedEvent(Friendship friendship, UserDto changer, UserDto targetUser,
            AccessLevel oldAccess, AccessLevel newAccess) {
        try {
            log.debug("Sending access level changed event: changer={}, target={}, old={}, new={}",
                    changer.getId(), targetUser.getId(), oldAccess, newAccess);

            String description = buildAccessLevelDescription(changer, oldAccess, newAccess);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .actorUserId(changer.getId())
                    .actorUserName(getDisplayName(changer))
                    .actorEmail(changer.getEmail())
                    .actorUser(buildUserInfo(changer))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .entityType(UnifiedActivityEvent.EntityType.FRIENDSHIP)
                    .entityId(friendship.getId().longValue())
                    .entityName("Access Level")
                    .action(UnifiedActivityEvent.Action.ACCESS_LEVEL_CHANGED)
                    .description(description)
                    .entityPayload(buildFriendshipPayload(friendship))
                    .metadata(buildAccessLevelMetadata(friendship, changer, oldAccess, newAccess))
                    .isOwnAction(false)
                    .isFriendActivity(true)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .build();

            producer.sendEvent(event);
            log.info("Access level changed event published: {} changed access for {} from {} to {}",
                    changer.getId(), targetUser.getId(), oldAccess, newAccess);

        } catch (Exception e) {
            log.error("Failed to send access level changed event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendUserBlockedEvent(UserDto blocker, UserDto blockedUser) {
        try {
            log.debug("Sending user blocked event: blocker={}, blocked={}",
                    blocker.getId(), blockedUser.getId());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .actorUserId(blocker.getId())
                    .actorUserName(getDisplayName(blocker))
                    .actorEmail(blocker.getEmail())
                    .actorUser(buildUserInfo(blocker))
                    .targetUserId(blockedUser.getId())
                    .targetUserName(getDisplayName(blockedUser))
                    .targetUser(buildUserInfo(blockedUser))
                    .entityType(UnifiedActivityEvent.EntityType.USER)
                    .entityId(blockedUser.getId().longValue())
                    .entityName("User Block")
                    .action(UnifiedActivityEvent.Action.USER_BLOCKED)
                    .description(String.format("%s blocked %s", getDisplayName(blocker), getDisplayName(blockedUser)))
                    .entityPayload(buildBlockPayload(blocker, blockedUser))
                    .isOwnAction(false)
                    .isFriendActivity(false)
                    .requiresAudit(true)
                    .requiresNotification(false)
                    .build();

            producer.sendEvent(event);
            log.info("User blocked event published: {} blocked {}", blocker.getId(), blockedUser.getId());

        } catch (Exception e) {
            log.error("Failed to send user blocked event: {}", e.getMessage(), e);
        }
    }

    @Async("friendActivityExecutor")
    public void sendUserUnblockedEvent(UserDto unblocker, UserDto unblockedUser) {
        try {
            log.debug("Sending user unblocked event: unblocker={}, unblocked={}",
                    unblocker.getId(), unblockedUser.getId());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .actorUserId(unblocker.getId())
                    .actorUserName(getDisplayName(unblocker))
                    .actorEmail(unblocker.getEmail())
                    .actorUser(buildUserInfo(unblocker))
                    .targetUserId(unblockedUser.getId())
                    .targetUserName(getDisplayName(unblockedUser))
                    .targetUser(buildUserInfo(unblockedUser))
                    .entityType(UnifiedActivityEvent.EntityType.USER)
                    .entityId(unblockedUser.getId().longValue())
                    .entityName("User Unblock")
                    .action(UnifiedActivityEvent.Action.USER_UNBLOCKED)
                    .description(
                            String.format("%s unblocked %s", getDisplayName(unblocker), getDisplayName(unblockedUser)))
                    .entityPayload(buildBlockPayload(unblocker, unblockedUser))
                    .isOwnAction(false)
                    .isFriendActivity(false)
                    .requiresAudit(true)
                    .requiresNotification(false)
                    .build();

            producer.sendEvent(event);
            log.info("User unblocked event published: {} unblocked {}", unblocker.getId(), unblockedUser.getId());

        } catch (Exception e) {
            log.error("Failed to send user unblocked event: {}", e.getMessage(), e);
        }
    }

    private UnifiedActivityEvent.UserInfo buildUserInfo(UserDto user) {
        if (user == null)
            return null;
        return UnifiedActivityEvent.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(getDisplayName(user))
                .image(user.getImage())
                .build();
    }

    private String getDisplayName(UserDto user) {
        if (user == null)
            return "Unknown";
        if (user.getFirstName() != null && user.getLastName() != null) {
            return user.getFirstName() + " " + user.getLastName();
        }
        if (user.getFirstName() != null)
            return user.getFirstName();
        if (user.getUsername() != null && !user.getUsername().isEmpty())
            return user.getUsername();
        return user.getEmail();
    }

    private Map<String, Object> buildFriendshipPayload(Friendship friendship) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("friendshipId", friendship.getId());
        payload.put("requesterId", friendship.getRequesterId());
        payload.put("recipientId", friendship.getRecipientId());
        payload.put("status", friendship.getStatus() != null ? friendship.getStatus().name() : null);
        payload.put("requesterAccess",
                friendship.getRequesterAccess() != null ? friendship.getRequesterAccess().name() : null);
        payload.put("recipientAccess",
                friendship.getRecipientAccess() != null ? friendship.getRecipientAccess().name() : null);
        payload.put("createdAt", friendship.getCreatedAt() != null ? friendship.getCreatedAt().toString() : null);
        payload.put("updatedAt", friendship.getUpdatedAt() != null ? friendship.getUpdatedAt().toString() : null);
        return payload;
    }

    private String buildFriendRequestMetadata(Friendship friendship, UserDto requester) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("friendshipId", friendship.getId());
            metadata.put("requesterId", friendship.getRequesterId());
            metadata.put("recipientId", friendship.getRecipientId());
            metadata.put("requesterName", getDisplayName(requester));
            metadata.put("requesterEmail", requester.getEmail());
            metadata.put("requesterImage", requester.getImage());
            metadata.put("status", FriendshipStatus.PENDING.name());
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.warn("Failed to build friend request metadata: {}", e.getMessage());
            return "{}";
        }
    }

    private String buildFriendshipStatusMetadata(Friendship friendship, UserDto actor, FriendshipStatus status) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("friendshipId", friendship.getId());
            metadata.put("actorId", actor.getId());
            metadata.put("actorName", getDisplayName(actor));
            metadata.put("status", status.name());
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.warn("Failed to build friendship status metadata: {}", e.getMessage());
            return "{}";
        }
    }

    private String buildFriendRemovedMetadata(Friendship friendship, UserDto remover) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("friendshipId", friendship.getId());
            metadata.put("removerId", remover.getId());
            metadata.put("removerName", getDisplayName(remover));
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.warn("Failed to build friend removed metadata: {}", e.getMessage());
            return "{}";
        }
    }

    private String buildAccessLevelDescription(UserDto changer, AccessLevel oldAccess, AccessLevel newAccess) {
        String changerName = getDisplayName(changer);

        if (newAccess == AccessLevel.NONE) {
            return String.format("%s revoked your expense access", changerName);
        } else if (newAccess == AccessLevel.READ) {
            if (oldAccess == AccessLevel.NONE) {
                return String.format("%s granted you read access to their expenses", changerName);
            } else {
                return String.format("%s changed your access to read-only", changerName);
            }
        } else if (newAccess == AccessLevel.WRITE) {
            return String.format("%s granted you full access to manage their expenses", changerName);
        }
        return String.format("%s updated your expense access level", changerName);
    }

    private String buildAccessLevelMetadata(Friendship friendship, UserDto changer,
            AccessLevel oldAccess, AccessLevel newAccess) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("friendshipId", friendship.getId());
            metadata.put("changerId", changer.getId());
            metadata.put("changerName", getDisplayName(changer));
            metadata.put("oldAccessLevel", oldAccess != null ? oldAccess.name() : null);
            metadata.put("newAccessLevel", newAccess != null ? newAccess.name() : null);
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.warn("Failed to build access level metadata: {}", e.getMessage());
            return "{}";
        }
    }

    private Map<String, Object> buildBlockPayload(UserDto actor, UserDto target) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("actorId", actor.getId());
        payload.put("actorName", getDisplayName(actor));
        payload.put("targetId", target.getId());
        payload.put("targetName", getDisplayName(target));
        return payload;
    }
}
