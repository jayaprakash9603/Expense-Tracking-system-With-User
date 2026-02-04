
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

    /**
     * Safely fetch user profile by ID, returning null if user doesn't exist
     */
    private static UserDto getUserProfileSafely(Integer userId) {
        try {
            return userService.getUserProfileById(userId);
        } catch (Exception e) {
            log.warn("User not found or error fetching user profile for userId={}: {}", userId, e.getMessage());
            return null;
        }
    }

    /**
     * Create a placeholder UserSummaryDTO for deleted users
     */
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

    /**
     * Convert a Friendship entity to a FriendshipResponseDTO
     * Returns null if both users are deleted, shows placeholder for single deleted
     * user
     */
    public static FriendshipResponseDTO toDTO(Friendship friendship) throws Exception {
        if (friendship == null)
            return null;

        // Add null check for userService
        if (userService == null) {
            throw new IllegalStateException("UserService is not initialized in FriendshipMapper");
        }

        UserDto requester = getUserProfileSafely(friendship.getRequesterId());
        UserDto recipient = getUserProfileSafely(friendship.getRecipientId());

        // If both users are deleted, skip this friendship
        if (requester == null && recipient == null) {
            log.warn("Both users deleted for friendship id={}, skipping", friendship.getId());
            return null;
        }

        // Create DTOs, using placeholder for deleted users
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

    /**
     * Convert a list of Friendship entities to a list of FriendshipResponseDTOs
     * Filters out friendships where conversion fails or both users are deleted
     */
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

    /**
     * Create a DTO with the perspective of the current user (showing the other user
     * as the "friend")
     * Returns null if the friendship cannot be converted (e.g., both users deleted)
     */
    public static FriendshipResponseDTO toDTOWithPerspective(Friendship friendship, Integer currentUserId)
            throws Exception {
        if (friendship == null)
            return null;

        FriendshipResponseDTO dto = toDTO(friendship);

        // If toDTO returned null (both users deleted), propagate null
        if (dto == null)
            return null;

        // If the current user is the recipient, swap the requester and recipient in the
        // DTO
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

    /**
     * Convert a list of Friendship entities to a list of FriendshipResponseDTOs
     * with user perspective
     * Filters out friendships where conversion fails or both users are deleted
     */
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

    // ... rest of the methods remain the same

    /**
     * Create a friendship status summary for a specific user
     */
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

    /**
     * Create a detailed friendship status object between two users
     */
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

    /**
     * Extract a list of friend user IDs from friendships
     */
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

    /**
     * Create a map of user IDs to their friendship status with the current user
     */
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

    /**
     * Create a map of user IDs to their access level for the current user's data
     */
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