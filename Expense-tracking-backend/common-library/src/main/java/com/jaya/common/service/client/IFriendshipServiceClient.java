package com.jaya.common.service.client;

import java.util.List;

/**
 * Interface for Friendship Service client operations.
 * Implementations:
 * - FeignFriendshipServiceClient: @Profile("!monolithic") - calls remote FRIENDSHIP-SERVICE
 * - LocalFriendshipServiceClient: @Profile("monolithic") - calls FriendshipService bean directly
 */
public interface IFriendshipServiceClient {

    /**
     * Check if a user can access another user's expenses (view permission).
     *
     * @param targetUserId the target user whose expenses are being accessed
     * @param requesterId the user requesting access
     * @return true if access is allowed
     */
    boolean canUserAccessExpenses(Integer targetUserId, Integer requesterId);

    /**
     * Check if a user can modify another user's expenses (edit permission).
     *
     * @param targetUserId the target user whose expenses are being modified
     * @param requesterId the user requesting modification
     * @return true if modification is allowed
     */
    boolean canUserModifyExpenses(Integer targetUserId, Integer requesterId);

    /**
     * Check if two users are friends.
     *
     * @param userId1 first user ID
     * @param userId2 second user ID
     * @return true if they are friends
     */
    boolean areFriends(Integer userId1, Integer userId2);

    /**
     * Get list of friend IDs for a user.
     *
     * @param userId the user ID
     * @return list of friend IDs
     */
    List<Integer> getFriendIds(Integer userId);

    /**
     * Get access level for a user viewing another user's data.
     *
     * @param userId the target user ID
     * @param viewerId the viewer user ID
     * @return access level string
     */
    String getUserAccessLevel(Integer userId, Integer viewerId);
}
