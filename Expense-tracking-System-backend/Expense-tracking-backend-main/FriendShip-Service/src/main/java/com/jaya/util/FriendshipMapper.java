
package com.jaya.util;

import com.jaya.dto.FriendshipResponseDTO;
import com.jaya.dto.UserSummaryDTO;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.UserDto;
import com.jaya.service.UserService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FriendshipMapper {

    private static UserService userService;

    public static void setUserService(UserService service) {
        userService = service;
    }

    /**
     * Convert a Friendship entity to a FriendshipResponseDTO
     */
    public static FriendshipResponseDTO toDTO(Friendship friendship) throws Exception {
        if (friendship == null) return null;

        // Add null check for userService
        if (userService == null) {
            throw new IllegalStateException("UserService is not initialized in FriendshipMapper");
        }

        UserDto requester = userService.getUserProfileById(friendship.getRequesterId());
        UserDto recipient = userService.getUserProfileById(friendship.getRecipientId());

        UserSummaryDTO requesterDTO = UserSummaryDTO.fromUser(requester);
        UserSummaryDTO recipientDTO = UserSummaryDTO.fromUser(recipient);

        return new FriendshipResponseDTO(
                friendship.getId(),
                requesterDTO,
                recipientDTO,
                friendship.getStatus(),
                friendship.getRequesterAccess(),
                friendship.getRecipientAccess()
        );
    }

    /**
     * Convert a list of Friendship entities to a list of FriendshipResponseDTOs
     */
    public static List<FriendshipResponseDTO> toDTOList(List<Friendship> friendships) {
        if (friendships == null) return new ArrayList<>();
        return friendships.stream()
                .map(f -> {
                    try {
                        return FriendshipMapper.toDTO(f);
                    } catch (Exception e) {
                        throw new RuntimeException("Error converting friendship to DTO: " + e.getMessage());
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * Create a DTO with the perspective of the current user (showing the other user as the "friend")
     */
    public static FriendshipResponseDTO toDTOWithPerspective(Friendship friendship, Integer currentUserId) throws Exception {
        if (friendship == null) return null;

        FriendshipResponseDTO dto = toDTO(friendship);

        // If the current user is the recipient, swap the requester and recipient in the DTO
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
     * Convert a list of Friendship entities to a list of FriendshipResponseDTOs with user perspective
     */
    public static List<FriendshipResponseDTO> toDTOListWithPerspective(List<Friendship> friendships, Integer currentUserId) {
        if (friendships == null) return new ArrayList<>();
        return friendships.stream()
                .map(f -> {
                    try {
                        return toDTOWithPerspective(f, currentUserId);
                    } catch (Exception e) {
                        throw new RuntimeException("Error converting friendship to DTO with perspective: " + e.getMessage());
                    }
                })
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
        if (friendships == null) return new ArrayList<>();

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
    public static Map<Integer, FriendshipStatus> createFriendshipStatusMap(List<Friendship> friendships, Integer currentUserId) {
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