package com.jaya.service;
import com.jaya.dto.BatchShareRequestItem;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.User;

import java.util.List;
import java.util.Map;

public interface FriendshipService {
    Friendship sendFriendRequest(Integer requesterId, Integer recipientId);

    Friendship respondToRequest(Integer friendshipId, Integer responderId, boolean accept);

    Friendship setAccessLevel(Integer friendshipId, Integer userId, AccessLevel accessLevel);

    List<Friendship> getUserFriendships(Integer userId);

    List<Friendship> getPendingRequests(Integer userId);

    List<Friendship> getIncomingRequests(Integer userId);

    List<Friendship> getOutgoingRequests(Integer userId);

    void cancelFriendRequest(Integer friendshipId, Integer userId);

    void removeFriendship(Integer friendshipId, Integer userId);

    void blockUser(Integer blockerId, Integer blockedId);

    void unblockUser(Integer unblockerId, Integer unblockedId);

    List<User> getBlockedUsers(Integer userId);

    int getTotalFriendsCount(Integer userId);

    int getIncomingRequestsCount(Integer userId);

    int getOutgoingRequestsCount(Integer userId);

    int getBlockedUsersCount(Integer userId);

    FriendshipStatus getFriendshipStatus(Integer userId1, Integer userId2);

    boolean isRequestSentByUser(Integer userId, Integer otherUserId);

    AccessLevel getUserAccessLevel(Integer ownerId, Integer viewerId);

    List<User> getFriendSuggestions(Integer userId, int limit);

    List<User> getMutualFriends(Integer userId1, Integer userId2);

    List<User> searchFriends(Integer userId, String query);

    boolean canUserAccessExpenses(Integer ownerId, Integer viewerId);

    boolean canUserModifyExpenses(Integer ownerId, Integer viewerId);

    List<Friendship> getAllUserFriendships(Integer userId);
    Friendship getFriendship(Integer userId1, Integer userId2);

    void updateFriendship(Friendship friendship);


    List<String> batchShareExpenses(Integer userId, List<BatchShareRequestItem> requests);


    List<Map<String, Object>> getRecommendedToShare(Integer userId);

    Map<String, Object> getExpenseSharingSummary(Integer userId);


    Map<String, Object> quickShareExpenses(Integer currentUserId, Integer targetUserId, AccessLevel accessLevel);


    List<Map<String, Object>> getSharedWithMe(Integer userId);
    List<Map<String, Object>> getISharedWith(Integer userId);
    Friendship getFriendshipById(Integer friendshipId, Integer userId);
    Map<String, Object> getExpenseAccessInfo(Integer ownerId, Integer viewerId);

    // FriendshipService.java
    List<Map<String, Object>> getDetailedFriends(Integer userId);

    // In FriendshipService.java
    Map<String, Object> getFriendshipDetails(Integer userId1, Integer userId2);
}