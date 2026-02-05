
package com.jaya.util;

import com.jaya.dto.FriendshipResponseDTO;
import com.jaya.dto.UserSummaryDTO;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.UserDto;
import com.jaya.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class FriendshipMapper {

    private static final Logger log = LoggerFactory.getLogger(FriendshipMapper.class);
    private static UserService userService;

    public static void setUserService(UserService service) {
        userService = service;
    }

    private static UserDto getUserProfileSafely(Integer userId) {
        try {
            return userService.getUserProfileById(userId);
        } catch (Exception e) {
            log.warn("User not found or error fetching user profile for userId={}: {}", userId, e.getMessage());
            return null;
        }
    }

    private static UserSummaryDTO createDeletedUserPlaceholder(Integer userId) {
        return new UserSummaryDTO(
                userId,
                "[Deleted User]",
                null,
                "Deleted",
                "User",
                null,
                null);
    }

    public static FriendshipResponseDTO toDTO(Friendship friendship) throws Exception {
        if (friendship == null)
            return null;

        if (userService == null) {
            throw new IllegalStateException("UserService is not initialized in FriendshipMapper");
        }

        UserDto requester = getUserProfileSafely(friendship.getRequesterId());
        UserDto recipient = getUserProfileSafely(friendship.getRecipientId());

        if (requester == null && recipient == null) {
            log.warn("Both users deleted for friendship id={}, skipping", friendship.getId());
            return null;
        }

        UserSummaryDTO requesterDTO = requester != null
                ? UserSummaryDTO.fromUser(requester)
                : createDeletedUserPlaceholder(friendship.getRequesterId());

        UserSummaryDTO recipientDTO = recipient != null
                ? UserSummaryDTO.fromUser(recipient)
                : createDeletedUserPlaceholder(friendship.getRecipientId());

        return new FriendshipResponseDTO(
                friendship.getId(),
                requesterDTO,
                recipientDTO,
                friendship.getStatus(),
                friendship.getRequesterAccess(),
                friendship.getRecipientAccess());
    }

    public static List<FriendshipResponseDTO> toDTOList(List<Friendship> friendships) {
        if (friendships == null)
            return new ArrayList<>();
        return friendships.stream()
                .map(f -> {
                    try {
                        return FriendshipMapper.toDTO(f);
                    } catch (Exception e) {
                        log.error("Error converting friendship id={} to DTO: {}", f.getId(), e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public static FriendshipResponseDTO toDTOWithPerspective(Friendship friendship, Integer currentUserId)
            throws Exception {
        if (friendship == null)
            return null;

        FriendshipResponseDTO dto = toDTO(friendship);

        if (dto == null)
            return null;

        if (friendship.getRecipientId().equals(currentUserId)) {
            UserSummaryDTO temp = dto.getRequester();
            dto.setRequester(dto.getRecipient());
            dto.setRecipient(temp);

            AccessLevel tempAccess = dto.getRequesterAccess();
            dto.setRequesterAccess(dto.getRecipientAccess());
            dto.setRecipientAccess(tempAccess);

            dto.setDirectionSwapped(true);
        } else {
            dto.setDirectionSwapped(false);
        }

        return dto;
    }

    public static List<FriendshipResponseDTO> toDTOListWithPerspective(List<Friendship> friendships,
            Integer currentUserId) {
        if (friendships == null)
            return new ArrayList<>();
        return friendships.stream()
                .map(f -> {
                    try {
                        return toDTOWithPerspective(f, currentUserId);
                    } catch (Exception e) {
                        log.error("Error converting friendship id={} to DTO with perspective: {}", f.getId(),
                                e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public static Map<String, Object> createFriendshipSummary(List<Friendship> friendships, Integer userId) {
        Map<String, Object> summary = new HashMap<>();

        long acceptedCount = friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .count();

        long pendingIncomingCount = friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.PENDING &&
                        f.getRecipientId().equals(userId))
                .count();

        long pendingOutgoingCount = friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.PENDING &&
                        f.getRequesterId().equals(userId))
                .count();

        long blockedCount = friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.BLOCKED)
                .count();

        summary.put("totalFriends", acceptedCount);
        summary.put("incomingRequests", pendingIncomingCount);
        summary.put("outgoingRequests", pendingOutgoingCount);
        summary.put("blockedUsers", blockedCount);

        return summary;
    }

    public static Map<String, Object> createFriendshipStatus(Friendship friendship, Integer currentUserId) {
        Map<String, Object> result = new HashMap<>();

        if (friendship == null) {
            result.put("status", "NONE");
            result.put("isFriend", false);
            result.put("isPending", false);
            result.put("isBlocked", false);
            return result;
        }

        FriendshipStatus status = friendship.getStatus();
        result.put("status", status);
        result.put("isFriend", status == FriendshipStatus.ACCEPTED);
        result.put("isPending", status == FriendshipStatus.PENDING);
        result.put("isBlocked", status == FriendshipStatus.BLOCKED);

        result.put("friendshipId", friendship.getId());

        if (status == FriendshipStatus.PENDING) {
            boolean sentByMe = friendship.getRequesterId().equals(currentUserId);
            result.put("sentByMe", sentByMe);
            result.put("canRespond", !sentByMe);
        }

        if (status == FriendshipStatus.ACCEPTED) {
            if (friendship.getRequesterId().equals(currentUserId)) {
                result.put("myAccessToTheirData", friendship.getRecipientAccess());
                result.put("theirAccessToMyData", friendship.getRequesterAccess());
            } else {
                result.put("myAccessToTheirData", friendship.getRequesterAccess());
                result.put("theirAccessToMyData", friendship.getRecipientAccess());
            }
        }

        if (status == FriendshipStatus.BLOCKED) {
            boolean blockedByMe = friendship.getRequesterId().equals(currentUserId);
            result.put("blockedByMe", blockedByMe);
            result.put("canUnblock", blockedByMe);
        }

        return result;
    }

    public static List<Integer> extractFriendIds(List<Friendship> friendships, Integer currentUserId) {
        if (friendships == null)
            return new ArrayList<>();

        return friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .map(f -> {
                    if (f.getRequesterId().equals(currentUserId)) {
                        return f.getRecipientId();
                    } else {
                        return f.getRequesterId();
                    }
                })
                .collect(Collectors.toList());
    }

    public static Map<Integer, FriendshipStatus> createFriendshipStatusMap(List<Friendship> friendships,
            Integer currentUserId) {
        Map<Integer, FriendshipStatus> statusMap = new HashMap<>();

        if (friendships != null) {
            for (Friendship f : friendships) {
                Integer otherUserId;
                if (f.getRequesterId().equals(currentUserId)) {
                    otherUserId = f.getRecipientId();
                } else {
                    otherUserId = f.getRequesterId();
                }

                statusMap.put(otherUserId, f.getStatus());
            }
        }

        return statusMap;
    }

    public static Map<Integer, AccessLevel> createAccessLevelMap(List<Friendship> friendships, Integer currentUserId) {
        Map<Integer, AccessLevel> accessMap = new HashMap<>();

        if (friendships != null) {
            for (Friendship f : friendships) {
                if (f.getStatus() == FriendshipStatus.ACCEPTED) {
                    if (f.getRequesterId().equals(currentUserId)) {
                        accessMap.put(f.getRecipientId(), f.getRequesterAccess());
                    } else {
                        accessMap.put(f.getRequesterId(), f.getRecipientAccess());
                    }
                }
            }
        }

        return accessMap;
    }
}