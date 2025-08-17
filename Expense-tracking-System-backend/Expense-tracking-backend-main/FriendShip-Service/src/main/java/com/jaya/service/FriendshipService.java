package com.jaya.service;

import com.jaya.dto.BatchShareRequestItem;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.UserDto;

import java.util.List;
import java.util.Map;

public interface FriendshipService {
    // Returns all friends (UserDto) of the user whose friendship status is ACCEPTED
    List<UserDto> getFriendsOfUser(Integer userId) throws Exception;
    Friendship sendFriendRequest(Integer requesterId, Integer recipientId) throws Exception;

    Friendship respondToRequest(Integer friendshipId, Integer responderId, boolean accept);

    Friendship setAccessLevel(Integer friendshipId, Integer userId, AccessLevel accessLevel);

    List<Friendship> getUserFriendships(Integer userId) throws Exception;

    List<Friendship> getPendingRequests(Integer userId) throws Exception;

    List<Friendship> getIncomingRequests(Integer userId) throws Exception;

    List<Friendship> getOutgoingRequests(Integer userId) throws Exception;

    void cancelFriendRequest(Integer friendshipId, Integer userId);

    void removeFriendship(Integer friendshipId, Integer userId);

    void blockUser(Integer blockerId, Integer blockedId) throws Exception;

    void unblockUser(Integer unblockerId, Integer unblockedId) throws Exception;

    List<UserDto> getBlockedUsers(Integer userId) throws Exception;

    int getTotalFriendsCount(Integer userId) throws Exception;

    int getIncomingRequestsCount(Integer userId) throws Exception;

    int getOutgoingRequestsCount(Integer userId) throws Exception;

    int getBlockedUsersCount(Integer userId) throws Exception;

    FriendshipStatus getFriendshipStatus(Integer userId1, Integer userId2) throws Exception;

    boolean isRequestSentByUser(Integer userId, Integer otherUserId) throws Exception;

    AccessLevel getUserAccessLevel(Integer ownerId, Integer viewerId) throws Exception;

    List<UserDto> getFriendSuggestions(Integer userId, int limit) throws Exception;

    List<UserDto> getMutualFriends(Integer userId1, Integer userId2) throws Exception;

    List<UserDto> searchFriends(Integer userId, String query) throws Exception;

    boolean canUserAccessExpenses(Integer ownerId, Integer viewerId) throws Exception;

    boolean canUserModifyExpenses(Integer ownerId, Integer viewerId) throws Exception;

    List<Friendship> getAllUserFriendships(Integer userId) throws Exception;
    Friendship getFriendship(Integer userId1, Integer userId2) throws Exception;

    boolean areFriends(Integer userId1, Integer userId2) throws Exception;

    void updateFriendship(Friendship friendship);


    List<String> batchShareExpenses(Integer userId, List<BatchShareRequestItem> requests);


    List<Map<String, Object>> getRecommendedToShare(Integer userId) throws Exception;

    Map<String, Object> getExpenseSharingSummary(Integer userId) throws Exception;


    Map<String, Object> quickShareExpenses(Integer currentUserId, Integer targetUserId, AccessLevel accessLevel) throws Exception;


    List<Map<String, Object>> getSharedWithMe(Integer userId) throws Exception;
    List<Map<String, Object>> getISharedWith(Integer userId) throws Exception;
    Friendship getFriendshipById(Integer friendshipId, Integer userId);
    Map<String, Object> getExpenseAccessInfo(Integer ownerId, Integer viewerId) throws Exception;

    // FriendshipService.java
    List<Map<String, Object>> getDetailedFriends(Integer userId) throws Exception;

    // In FriendshipService.java
    Map<String, Object> getFriendshipDetails(Integer userId1, Integer userId2) throws Exception;
}