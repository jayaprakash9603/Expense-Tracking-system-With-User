// File: com.jaya.util.FriendshipMapper.java
package com.jaya.util;

import com.jaya.dto.FriendshipResponseDTO;
import com.jaya.dto.UserSummaryDTO;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.User;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FriendshipMapper {
    /**
     * Convert a Friendship entity to a FriendshipResponseDTO
     */
    public static FriendshipResponseDTO toDTO(Friendship friendship) {
        if (friendship == null) return null;
        UserSummaryDTO requester = UserSummaryDTO.fromUser(friendship.getRequester());
        UserSummaryDTO recipient = UserSummaryDTO.fromUser(friendship.getRecipient());
        return new FriendshipResponseDTO(
                friendship.getId(),
                requester,
                recipient,
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
                .map(FriendshipMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a DTO with the perspective of the current user (showing the other user as the "friend")
     */
    public static FriendshipResponseDTO toDTOWithPerspective(Friendship friendship, Integer currentUserId) {
        if (friendship == null) return null;

        FriendshipResponseDTO dto = toDTO(friendship);

        // If the current user is the recipient, swap the requester and recipient in the DTO
        // This makes the UI simpler by always showing the other user as the "friend"
        if (friendship.getRecipient().getId().equals(currentUserId)) {
            UserSummaryDTO temp = dto.getRequester();
            dto.setRequester(dto.getRecipient());
            dto.setRecipient(temp);

            // Also swap the access levels to maintain consistency
            AccessLevel tempAccess = dto.getRequesterAccess();
            dto.setRequesterAccess(dto.getRecipientAccess());
            dto.setRecipientAccess(tempAccess);

            // Add a flag to indicate the direction was swapped
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
                .map(f -> toDTOWithPerspective(f, currentUserId))
                .collect(Collectors.toList());
    }

    /**
     * Create a friendship status summary for a specific user
     */
    public static Map<String, Object> createFriendshipSummary(List<Friendship> friendships, Integer userId) {
        Map<String, Object> summary = new HashMap<>();

        // Count friendships by status
        long acceptedCount = friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .count();

        long pendingIncomingCount = friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.PENDING &&
                        f.getRecipient().getId().equals(userId))
                .count();

        long pendingOutgoingCount = friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.PENDING &&
                        f.getRequester().getId().equals(userId))
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

        // Add friendship ID for reference
        result.put("friendshipId", friendship.getId());

        // Determine if the current user sent the request
        if (status == FriendshipStatus.PENDING) {
            boolean sentByMe = friendship.getRequester().getId().equals(currentUserId);
            result.put("sentByMe", sentByMe);
            result.put("canRespond", !sentByMe);
        }

        // Add access level information if they are friends
        if (status == FriendshipStatus.ACCEPTED) {
            if (friendship.getRequester().getId().equals(currentUserId)) {
                result.put("myAccessToTheirData", friendship.getRecipientAccess());
                result.put("theirAccessToMyData", friendship.getRequesterAccess());
            } else {
                result.put("myAccessToTheirData", friendship.getRequesterAccess());
                result.put("theirAccessToMyData", friendship.getRecipientAccess());
            }
        }

        // Add who blocked whom in case of blocked status
        if (status == FriendshipStatus.BLOCKED) {
            boolean blockedByMe = friendship.getRequester().getId().equals(currentUserId);
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
                    if (f.getRequester().getId().equals(currentUserId)) {
                        return f.getRecipient().getId();
                    } else {
                        return f.getRequester().getId();
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
                if (f.getRequester().getId().equals(currentUserId)) {
                    otherUserId = f.getRecipient().getId();
                } else {
                    otherUserId = f.getRequester().getId();
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
                    if (f.getRequester().getId().equals(currentUserId)) {
                        accessMap.put(f.getRecipient().getId(), f.getRequesterAccess());
                    } else {
                        accessMap.put(f.getRequester().getId(), f.getRecipientAccess());
                    }
                }
            }
        }

        return accessMap;
    }
}