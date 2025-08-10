//package com.jaya.service;
//
//import com.jaya.dto.BatchShareRequestItem;
//import com.jaya.dto.User;
//import com.jaya.exceptions.UserException;
//import com.jaya.models.AccessLevel;
//import com.jaya.models.Friendship;
//import com.jaya.models.FriendshipStatus;
//import com.jaya.repository.FriendshipRepository;
//import com.jaya.util.ServiceHelper;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//public class FriendshipServiceImpl implements FriendshipService {
//    @Autowired
//    private FriendshipRepository friendshipRepository;
//
//    @Autowired
//    private ServiceHelper helper;
//
////    @Autowired
////    private SocketService socketService;
//
//    @Override
//    public Friendship sendFriendRequest(Integer requesterId, Integer recipientId) throws Exception {
//        // Check if user is trying to send request to themselves
//        if (requesterId.equals(recipientId)) {
//            throw new RuntimeException("Cannot send friend request to yourself");
//        }
//
//        User requester = helper.validateUser(requesterId);
//        User recipient = helper.validateUser(recipientId);
//
//        // Check if request already exists in either direction
//        if (friendshipRepository.findByRequesterIdAndRecipientId(requester.getId(), recipient.getId()).isPresent() ||
//                friendshipRepository.findByRequesterIdAndRecipientId(recipient.getId(), requester.getId()).isPresent()) {
//            throw new RuntimeException("A friendship request already exists between these users");
//        }
//
//        Friendship friendship = new Friendship(null, requester.getId(), recipient.getId(), FriendshipStatus.PENDING, AccessLevel.NONE, AccessLevel.NONE);
//        friendship = friendshipRepository.save(friendship);
//
//        // Notify recipient about the new friend request
////        socketService.notifyNewFriendRequest(friendship);
//
//        return friendship;
//    }
//
//    @Override
//    public Friendship respondToRequest(Integer friendshipId, Integer responderId, boolean accept) {
//        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow(() ->
//                new RuntimeException("Friendship request not found with ID: " + friendshipId));
//
//        if (friendship.getStatus() != FriendshipStatus.PENDING) {
//            throw new RuntimeException("This request has already been processed");
//        }
//
//        // Verify that the responder is the recipient of the friend request
//        if (!friendship.getRecipientId().equals(responderId)) {
//            throw new RuntimeException("Only the recipient of a friend request can respond to it");
//        }
//
//        friendship.setStatus(accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.REJECTED);
//
//        // If accepted, set default access levels (NONE for both users)
//        if (accept) {
//            friendship.setRequesterAccess(AccessLevel.NONE);
//            friendship.setRecipientAccess(AccessLevel.NONE);
//        }
//
//        friendship = friendshipRepository.save(friendship);
//
//        // Notify requester about the response
////        socketService.notifyFriendRequestResponse(friendship);
//
//        return friendship;
//    }
//
//    @Override
//    public Friendship setAccessLevel(Integer friendshipId, Integer userId, AccessLevel accessLevel) {
//        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow(() ->
//                new RuntimeException("Friendship not found with ID: " + friendshipId));
//
//        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
//            throw new RuntimeException("Cannot set access level for non-accepted friendship");
//        }
//
//        // Determine if the user is the requester or recipient and set the appropriate access level
//        if (friendship.getRequesterId().equals(userId)) {
//            friendship.setRecipientAccess(accessLevel);
//        } else if (friendship.getRecipientId().equals(userId)) {
//            friendship.setRequesterAccess(accessLevel);
//        } else {
//            throw new RuntimeException("User is not a participant in this friendship");
//        }
//
//        return friendshipRepository.save(friendship);
//    }
//
//    @Override
//    public List<Friendship> getUserFriendships(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        List<Friendship> friendships = friendshipRepository.findByRequesterIdOrRecipientId(user.getId(), user.getId());
//        return friendships.stream()
//                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<Friendship> getPendingRequests(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        List<Friendship> allFriendships = friendshipRepository.findByRequesterIdOrRecipientId(user.getId(), user.getId());
//        return allFriendships.stream()
//                .filter(f -> f.getStatus() == FriendshipStatus.PENDING)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<Friendship> getIncomingRequests(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        return friendshipRepository.findByRecipientIdAndStatus(user.getId(), FriendshipStatus.PENDING);
//    }
//
//    @Override
//    public List<Friendship> getOutgoingRequests(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        return friendshipRepository.findByRequesterIdAndStatus(user.getId(), FriendshipStatus.PENDING);
//    }
//
//    @Override
//    @Transactional
//    public void cancelFriendRequest(Integer friendshipId, Integer userId) {
//        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow(() ->
//                new RuntimeException("Friendship request not found with ID: " + friendshipId));
//
//        // Only the requester can cancel a pending request
//        if (!friendship.getRequesterId().equals(userId)) {
//            throw new RuntimeException("Only the requester can cancel a friend request");
//        }
//
//        if (friendship.getStatus() != FriendshipStatus.PENDING) {
//            throw new RuntimeException("Only pending requests can be cancelled");
//        }
//
//        friendshipRepository.delete(friendship);
//    }
//
//    @Override
//    @Transactional
//    public void removeFriendship(Integer friendshipId, Integer userId) {
//        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow(() ->
//                new RuntimeException("Friendship not found with ID: " + friendshipId));
//
//        // Verify the user is part of this friendship
//        if (!friendship.getRequesterId().equals(userId) && !friendship.getRecipientId().equals(userId)) {
//            throw new RuntimeException("User is not part of this friendship");
//        }
//
//        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
//            throw new RuntimeException("Only accepted friendships can be removed");
//        }
//
//        friendshipRepository.delete(friendship);
//    }
//
//    @Override
//    @Transactional
//    public void blockUser(Integer blockerId, Integer blockedId) throws Exception {
//        // Prevent self-blocking
//        if (blockerId.equals(blockedId)) {
//            throw new RuntimeException("Cannot block yourself");
//        }
//
//        User blocker = helper.validateUser(blockerId);
//        User blocked = helper.validateUser(blockedId);
//
//        // Check if there's an existing friendship in either direction
//        Optional<Friendship> existingFriendship = friendshipRepository.findByRequesterIdAndRecipientId(blocker.getId(), blocked.getId());
//        if (existingFriendship.isEmpty()) {
//            existingFriendship = friendshipRepository.findByRequesterIdAndRecipientId(blocked.getId(), blocker.getId());
//        }
//
//        Friendship friendship;
//        if (existingFriendship.isPresent()) {
//            // Update existing friendship to blocked status
//            friendship = existingFriendship.get();
//            friendship.setStatus(FriendshipStatus.BLOCKED);
//
//            // Ensure the blocker is the requester in the blocked relationship
//            if (!friendship.getRequesterId().equals(blockerId)) {
//                // Swap requester and recipient
//                Integer tempRequester = friendship.getRequesterId();
//                friendship.setRequesterId(friendship.getRecipientId());
//                friendship.setRecipientId(tempRequester);
//
//                // Reset access levels
//                friendship.setRequesterAccess(AccessLevel.NONE);
//                friendship.setRecipientAccess(AccessLevel.NONE);
//            }
//        } else {
//            // Create a new blocked relationship
//            friendship = new Friendship(null, blocker.getId(), blocked.getId(), FriendshipStatus.BLOCKED, AccessLevel.NONE, AccessLevel.NONE);
//        }
//
//        friendshipRepository.save(friendship);
//    }
//
//    @Override
//    @Transactional
//    public void unblockUser(Integer unblockerId, Integer unblockedId) throws Exception {
//        // Prevent self-unblocking (though this should never happen)
//        if (unblockerId.equals(unblockedId)) {
//            throw new RuntimeException("Cannot unblock yourself");
//        }
//
//        User unblocker = helper.validateUser(unblockerId);
//        User unblocked = helper.validateUser(unblockedId);
//
//        // Find the blocked relationship
//        Optional<Friendship> blockedFriendship = friendshipRepository.findByRequesterIdAndRecipientIdAndStatus(
//                unblocker.getId(), unblocked.getId(), FriendshipStatus.BLOCKED);
//
//        if (blockedFriendship.isEmpty()) {
//            throw new RuntimeException("No blocking relationship found between these users");
//        }
//
//        // Delete the blocked relationship
//        friendshipRepository.delete(blockedFriendship.get());
//    }
//
//    @Override
//    public List<User> getBlockedUsers(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        List<Friendship> blockedRelationships = friendshipRepository.findByRequesterIdAndStatus(userId, FriendshipStatus.BLOCKED);
//
//        return blockedRelationships.stream()
//                .map(friendship -> {
//                    try {
//                        return helper.validateUser(friendship.getRecipientId());
//                    } catch (Exception e) {
//                        throw new RuntimeException("Error retrieving blocked user: " + e.getMessage());
//                    }
//                })
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public int getTotalFriendsCount(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        List<Friendship> friendships = friendshipRepository.findByRequesterIdOrRecipientIdAndStatus(
//                user.getId(), user.getId(), FriendshipStatus.ACCEPTED);
//
//        return friendships.size();
//    }
//
//    @Override
//    public int getIncomingRequestsCount(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        return friendshipRepository.countByRecipientIdAndStatus(user.getId(), FriendshipStatus.PENDING);
//    }
//
//    @Override
//    public int getOutgoingRequestsCount(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        return friendshipRepository.countByRequesterIdAndStatus(user.getId(), FriendshipStatus.PENDING);
//    }
//
//    @Override
//    public int getBlockedUsersCount(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        return friendshipRepository.countByRequesterIdAndStatus(user.getId(), FriendshipStatus.BLOCKED);
//    }
//
//    @Override
//    public FriendshipStatus getFriendshipStatus(Integer userId1, Integer userId2) throws Exception {
//        // If checking status with self, return NONE
//        if (userId1.equals(userId2)) {
//            return FriendshipStatus.NONE;
//        }
//
//        User user1 = helper.validateUser(userId1);
//        User user2 = helper.validateUser(userId2);
//
//        // Check for friendship in both directions
//        Optional<Friendship> friendship1 = friendshipRepository.findByRequesterIdAndRecipientId(user1.getId(), user2.getId());
//        if (friendship1.isPresent()) {
//            return friendship1.get().getStatus();
//        }
//
//        Optional<Friendship> friendship2 = friendshipRepository.findByRequesterIdAndRecipientId(user2.getId(), user1.getId());
//        if (friendship2.isPresent()) {
//            return friendship2.get().getStatus();
//        }
//
//        return FriendshipStatus.NONE;
//    }
//
//    @Override
//    public boolean isRequestSentByUser(Integer userId, Integer otherUserId) throws Exception {
//        // Cannot send request to self
//        if (userId.equals(otherUserId)) {
//            return false;
//        }
//
//        User user = helper.validateUser(userId);
//        User otherUser = helper.validateUser(otherUserId);
//
//        Optional<Friendship> friendship = friendshipRepository.findByRequesterIdAndRecipientIdAndStatus(
//                user.getId(), otherUser.getId(), FriendshipStatus.PENDING);
//
//        return friendship.isPresent();
//    }
//
//    @Override
//    public Friendship getFriendship(Integer userId1, Integer userId2) throws Exception {
//        // No friendship with self
//        if (userId1.equals(userId2)) {
//            return null;
//        }
//
//        User user1 = helper.validateUser(userId1);
//        User user2 = helper.validateUser(userId2);
//
//        // Check for friendship in both directions
//        Optional<Friendship> friendship1 = friendshipRepository.findByRequesterIdAndRecipientId(user1.getId(), user2.getId());
//        if (friendship1.isPresent()) {
//            return friendship1.get();
//        }
//
//        Optional<Friendship> friendship2 = friendshipRepository.findByRequesterIdAndRecipientId(user2.getId(), user1.getId());
//        if (friendship2.isPresent()) {
//            return friendship2.get();
//        }
//
//        return null;
//    }
//
//    @Override
//    public List<Friendship> getAllUserFriendships(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        return friendshipRepository.findByRequesterIdOrRecipientId(user.getId(), user.getId());
//    }
//
//    @Override
//    public List<User> getFriendSuggestions(Integer userId, int limit) throws Exception {
//        User user = helper.validateUser(userId);
//
//        // Get all current friends and pending requests
//        List<Friendship> allRelationships = friendshipRepository.findByRequesterIdOrRecipientId(userId, userId);
//
//        // Extract all user IDs that should be excluded from suggestions
//        Set<Integer> excludedUserIds = new HashSet<>();
//        excludedUserIds.add(userId); // Explicitly exclude self
//
//        for (Friendship friendship : allRelationships) {
//            if (friendship.getRequesterId().equals(userId)) {
//                excludedUserIds.add(friendship.getRecipientId());
//            } else {
//                excludedUserIds.add(friendship.getRequesterId());
//            }
//        }
//
//        // Get friends of friends (for better suggestions)
//        List<User> friendsOfFriends = new ArrayList<>();
//        List<User> directFriends = getUserFriendships(userId).stream()
//                .map(f -> {
//                    try {
//                        Integer friendId = f.getRequesterId().equals(userId) ? f.getRecipientId() : f.getRequesterId();
//                        return helper.validateUser(friendId);
//                    } catch (Exception e) {
//                        throw new RuntimeException("Error retrieving friend: " + e.getMessage());
//                    }
//                })
//                .collect(Collectors.toList());
//
//        for (User friend : directFriends) {
//            List<User> friendsFriends = getUserFriendships(friend.getId()).stream()
//                    .map(f -> {
//                        try {
//                            Integer friendFriendId = f.getRequesterId().equals(friend.getId()) ? f.getRecipientId() : f.getRequesterId();
//                            return helper.validateUser(friendFriendId);
//                        } catch (Exception e) {
//                            throw new RuntimeException("Error retrieving friend's friend: " + e.getMessage());
//                        }
//                    })
//                    .filter(f -> !excludedUserIds.contains(f.getId()))
//                    .collect(Collectors.toList());
//
//            friendsOfFriends.addAll(friendsFriends);
//            // Add these to excluded IDs to avoid duplicates
//            friendsFriends.forEach(f -> excludedUserIds.add(f.getId()));
//        }
//
//        // If we don't have enough suggestions from friends of friends, add some random users
//        if (friendsOfFriends.size() < limit) {
//            List<User> randomUsers = friendshipRepository.findRandomUsers(excludedUserIds, org.springframework.data.domain.PageRequest.of(0, limit - friendsOfFriends.size()));
//            friendsOfFriends.addAll(randomUsers);
//        }
//
//        // Limit the results
//        if (friendsOfFriends.size() > limit) {
//            return friendsOfFriends.subList(0, limit);
//        }
//
//        return friendsOfFriends;
//    }
//
//    @Override
//    public List<User> getMutualFriends(Integer userId1, Integer userId2) throws Exception {
//        // No mutual friends with self
//        if (userId1.equals(userId2)) {
//            return Collections.emptyList();
//        }
//
//        // Get friends of both users
//        List<Integer> friendsOfUser1 = getUserFriendships(userId1).stream()
//                .map(f -> f.getRequesterId().equals(userId1) ? f.getRecipientId() : f.getRequesterId())
//                .collect(Collectors.toList());
//
//        List<Integer> friendsOfUser2 = getUserFriendships(userId2).stream()
//                .map(f -> f.getRequesterId().equals(userId2) ? f.getRecipientId(): f.getRequesterId())
//                .collect(Collectors.toList());
//
//        // Find the intersection (mutual friends)
//        Set<User> friendIds1 = friendsOfUser1.stream()
//                .map(e-> {
//                    try {
//                        return helper.validateUser(e);
//                    } catch (Exception ex) {
//                        throw new RuntimeException(ex);
//                    }
//                })
//                .collect(Collectors.toSet());
//
//        Set<User> friendIds2 = friendsOfUser2.stream()
//                .map(e-> {
//                    try {
//                        return helper.validateUser(e);
//                    } catch (Exception ex) {
//                        throw new RuntimeException(ex);
//                    }
//                })
//                .collect(Collectors.toSet());
//
//        // FIXED: Use contains() to check if the user exists in the set
//        return friendIds2.stream()
//                .filter(user -> friendIds1.contains(user))  // ✅ CORRECT: Check if the set contains the user
//                .collect(Collectors.toList());
//    }
//    @Override
//    public List<User> searchFriends(Integer userId, String query) throws Exception {
//        if (query == null || query.trim().isEmpty()) {
//            return List.of();
//        }
//
//        // Get all friends of the user
//        List<Integer> friends = getUserFriendships(userId).stream()
//                .map(f -> f.getRequesterId().equals(userId) ? f.getRecipientId() : f.getRequesterId())
//                .collect(Collectors.toList());
//
//        List<User> users=friends.stream().map(e-> {
//            try {
//                return helper.validateUser(e);
//            } catch (Exception ex) {
//                throw new RuntimeException(ex);
//            }
//        }).collect(Collectors.toList());
//        // Filter friends based on the search query
//        String lowercaseQuery = query.toLowerCase();
//        return users.stream()
//                .filter(friend ->
//                        (friend.getFirstName() != null && friend.getFirstName().toLowerCase().contains(lowercaseQuery)) ||
//                                (friend.getLastName() != null && friend.getLastName().toLowerCase().contains(lowercaseQuery)) ||
//                                (friend.getUsername() != null && friend.getUsername().toLowerCase().contains(lowercaseQuery)) ||
//                                (friend.getEmail() != null && friend.getEmail().toLowerCase().contains(lowercaseQuery))
//                )
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public boolean canUserAccessExpenses(Integer ownerId, Integer viewerId) throws Exception {
//        // If it's the same user, they can access their own expenses
//        if (ownerId.equals(viewerId)) {
//            return true;
//        }
//
//        // Check if there's a friendship between the users
//        Friendship friendship = getFriendship(ownerId, viewerId);
//        if (friendship == null || friendship.getStatus() != FriendshipStatus.ACCEPTED) {
//            return false;
//        }
//
//        // Check the access level
//        AccessLevel accessLevel = getUserAccessLevel(ownerId, viewerId);
//
//        // READ, WRITE, FULL, LIMITED, or SUMMARY access allows viewing expenses
//        return accessLevel == AccessLevel.READ ||
//                accessLevel == AccessLevel.WRITE ||
//                accessLevel == AccessLevel.FULL ||
//                accessLevel == AccessLevel.LIMITED ||
//                accessLevel == AccessLevel.SUMMARY;
//    }
//
//    @Override
//    public boolean canUserModifyExpenses(Integer ownerId, Integer viewerId) throws Exception {
//        // If it's the same user, they can modify their own expenses
//        if (ownerId.equals(viewerId)) {
//            return true;
//        }
//
//        // Check if there's a friendship between the users
//        Friendship friendship = getFriendship(ownerId, viewerId);
//        if (friendship == null || friendship.getStatus() != FriendshipStatus.ACCEPTED) {
//            return false;
//        }
//
//        // Check the access level
//        AccessLevel accessLevel = getUserAccessLevel(ownerId, viewerId);
//
//        // Only WRITE or FULL access allows modifying expenses
//        return accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL;
//    }
//
//    @Override
//    public AccessLevel getUserAccessLevel(Integer ownerId, Integer viewerId) throws Exception {
//        // If it's the same user, they have full access to their own expenses
//        if (ownerId.equals(viewerId)) {
//            return AccessLevel.FULL;
//        }
//
//        // Get the friendship between the users
//        Friendship friendship = getFriendship(ownerId, viewerId);
//        if (friendship == null || friendship.getStatus() != FriendshipStatus.ACCEPTED) {
//            return AccessLevel.NONE;
//        }
//
//        // Determine the access level based on the friendship direction
//        if (friendship.getRequesterId().equals(ownerId)) {
//            // Owner is the requester, so check what access they gave to the recipient (viewer)
//            return friendship.getRecipientAccess();
//        } else {
//            // Owner is the recipient, so check what access they gave to the requester (viewer)
//            return friendship.getRequesterAccess();
//        }
//    }
//
//    @Override
//    public void updateFriendship(Friendship friendship) {
//        if (friendship == null) {
//            throw new RuntimeException("Friendship cannot be null");
//        }
//
//        // Verify the friendship exists
//        friendshipRepository.findById(friendship.getId())
//                .orElseThrow(() -> new RuntimeException("Friendship not found with ID: " + friendship.getId()));
//
//        friendshipRepository.save(friendship);
//    }
//
//    @Override
//    public List<String> batchShareExpenses(Integer userId, List<BatchShareRequestItem> requests) {
//        List<String> results = new ArrayList<>();
//        for (BatchShareRequestItem item : requests) {
//            try {
//                Integer targetUserId = item.getUserId();
//
//                // Prevent sharing with self
//                if (userId.equals(targetUserId)) {
//                    results.add("User ID " + targetUserId + ": Cannot share expenses with yourself");
//                    continue;
//                }
//
//                AccessLevel accessLevel = AccessLevel.valueOf(item.getAccessLevel());
//
//                Friendship friendship = getFriendship(userId, targetUserId);
//                if (friendship != null && friendship.getStatus() == FriendshipStatus.ACCEPTED) {
//                    if (friendship.getRequesterId().equals(userId)) {
//                        friendship.setRecipientAccess(accessLevel);
//                    } else {
//                        friendship.setRequesterAccess(accessLevel);
//                    }
//                    updateFriendship(friendship);
//                    results.add("User ID " + targetUserId + ": Access updated to " + accessLevel);
//                } else {
//                    results.add("User ID " + targetUserId + ": No active friendship found");
//                }
//            } catch (Exception e) {
//                results.add("User ID " + item.getUserId() + ": Error - " + e.getMessage());
//            }
//        }
//        return results;
//    }
//
//    @Override
//    public List<Map<String, Object>> getRecommendedToShare(Integer userId) throws Exception {
//        List<Friendship> friendships = getUserFriendships(userId);
//        List<Map<String, Object>> recommendations = friendships.stream()
//                .filter(f -> {
//                    AccessLevel accessLevel;
//                    if (f.getRequesterId().equals(userId)) {
//                        accessLevel = f.getRecipientAccess();
//                    } else {
//                        accessLevel = f.getRequesterAccess();
//                    }
//                    return accessLevel == AccessLevel.NONE;
//                })
//                .map(f -> {
//                    try {
//                        Integer friendId = f.getRequesterId().equals(userId)
//                                ? f.getRecipientId() : f.getRequesterId();
//                        User friend = helper.validateUser(friendId);
//
//                        Map<String, Object> friendInfo = new HashMap<>();
//                        friendInfo.put("userId", friend.getId());
//                        friendInfo.put("name", friend.getFirstName() + " " + friend.getLastName());
//                        friendInfo.put("username", friend.getUsername());
//                        friendInfo.put("email", friend.getEmail());
//
//                        AccessLevel theirAccessLevel = getUserAccessLevel(friend.getId(), userId);
//                        friendInfo.put("theySharedWithYou", theirAccessLevel != AccessLevel.NONE);
//
//                        return friendInfo;
//                    } catch (Exception e) {
//                        throw new RuntimeException("Error processing friend recommendation: " + e.getMessage());
//                    }
//                })
//                .collect(Collectors.toList());
//        return recommendations;
//    }
//
//
//    @Override
//    public Map<String, Object> getExpenseSharingSummary(Integer userId) throws Exception {
//        User user = helper.validateUser(userId);
//
//        List<Friendship> friendships = getUserFriendships(userId);
//
//        int totalFriends = friendships.size();
//        int sharedWithMe = (int) friendships.stream()
//                .filter(f -> {
//                    AccessLevel accessLevel;
//                    if (f.getRequesterId().equals(userId)) {
//                        accessLevel = f.getRequesterAccess();
//                    } else {
//                        accessLevel = f.getRecipientAccess();
//                    }
//                    return accessLevel != AccessLevel.NONE;
//                })
//                .count();
//
//        int iSharedWith = (int) friendships.stream()
//                .filter(f -> {
//                    AccessLevel accessLevel;
//                    if (f.getRequesterId().equals(userId)) {
//                        accessLevel = f.getRecipientAccess();
//                    } else {
//                        accessLevel = f.getRequesterAccess();
//                    }
//                    return accessLevel != AccessLevel.NONE;
//                })
//                .count();
//
//        Map<String, Object> summary = new HashMap<>();
//        summary.put("totalFriends", totalFriends);
//        summary.put("sharedWithMe", sharedWithMe);
//        summary.put("iSharedWith", iSharedWith);
//        summary.put("notSharedYet", totalFriends - iSharedWith);
//
//        return summary;
//    }
//    @Override
//    public Map<String, Object> quickShareExpenses(Integer currentUserId, Integer targetUserId, AccessLevel accessLevel) throws Exception {
//        // Prevent sharing with self
//        if (currentUserId.equals(targetUserId)) {
//            throw new RuntimeException("Cannot share expenses with yourself");
//        }
//
//        Friendship friendship = getFriendship(currentUserId, targetUserId);
//        if (friendship == null) {
//            throw new RuntimeException("No friendship exists with this user");
//        }
//        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
//            throw new RuntimeException("Cannot share with a user who is not an accepted friend");
//        }
//
//        if (friendship.getRequesterId().equals(currentUserId)) {
//            friendship.setRecipientAccess(accessLevel);
//        } else {
//            friendship.setRequesterAccess(accessLevel);
//        }
//
//        updateFriendship(friendship);
//
//        Map<String, Object> result = new HashMap<>();
//        result.put("message", "Access level updated successfully");
//        result.put("accessLevel", accessLevel);
//        return result;
//    }
//
//    @Override
//    public List<Map<String, Object>> getSharedWithMe(Integer userId) throws Exception {
//        List<Friendship> friendships = getUserFriendships(userId);
//        return friendships.stream()
//                .filter(f -> {
//                    AccessLevel accessLevel;
//                    if (f.getRequesterId().equals(userId)) {
//                        accessLevel = f.getRequesterAccess();
//                    } else {
//                        accessLevel = f.getRecipientAccess();
//                    }
//                    return accessLevel != AccessLevel.NONE;
//                })
//                .map(f -> {
//                    try {
//                        Integer friendId = f.getRequesterId().equals(userId)
//                                ? f.getRecipientId() : f.getRequesterId();
//                        User friend = helper.validateUser(friendId);
//
//                        AccessLevel accessLevel = getUserAccessLevel(friend.getId(), userId);
//
//                        Map<String, Object> shareInfo = new HashMap<>();
//                        shareInfo.put("userId", friend.getId());
//                        shareInfo.put("name", friend.getFirstName() + " " + friend.getLastName());
//                        shareInfo.put("username", friend.getUsername());
//                        shareInfo.put("email", friend.getEmail());
//                        shareInfo.put("accessLevel", accessLevel);
//                        shareInfo.put("canModify", accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL);
//
//                        return shareInfo;
//                    } catch (Exception e) {
//                        throw new RuntimeException("Error processing shared user: " + e.getMessage());
//                    }
//                })
//                .collect(Collectors.toList());
//    }
//    @Override
//    public List<Map<String, Object>> getISharedWith(Integer userId) throws Exception {
//        List<Friendship> friendships = getUserFriendships(userId);
//        return friendships.stream()
//                .filter(f -> {
//                    AccessLevel accessLevel;
//                    if (f.getRequesterId().equals(userId)) {
//                        accessLevel = f.getRecipientAccess();
//                    } else {
//                        accessLevel = f.getRequesterAccess();
//                    }
//                    return accessLevel != AccessLevel.NONE;
//                })
//                .map(f -> {
//                    try {
//                        Integer friendId = f.getRequesterId().equals(userId)
//                                ? f.getRecipientId() : f.getRequesterId();
//                        User friend = helper.validateUser(friendId);
//
//                        AccessLevel accessLevel = getUserAccessLevel(userId, friend.getId());
//
//                        Map<String, Object> shareInfo = new HashMap<>();
//                        shareInfo.put("userId", friend.getId());
//                        shareInfo.put("name", friend.getFirstName() + " " + friend.getLastName());
//                        shareInfo.put("username", friend.getUsername());
//                        shareInfo.put("email", friend.getEmail());
//                        shareInfo.put("accessLevel", accessLevel);
//                        shareInfo.put("canModify", accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL);
//
//                        return shareInfo;
//                    } catch (Exception e) {
//                        throw new RuntimeException("Error processing shared user: " + e.getMessage());
//                    }
//                })
//                .collect(Collectors.toList());
//    }
//    @Override
//    public Map<String, Object> getExpenseAccessInfo(Integer ownerId, Integer viewerId) throws Exception {
//        Map<String, Object> accessInfo = new HashMap<>();
//        accessInfo.put("canView", canUserAccessExpenses(ownerId, viewerId));
//        accessInfo.put("canModify", canUserModifyExpenses(ownerId, viewerId));
//        accessInfo.put("accessLevel", getUserAccessLevel(ownerId, viewerId));
//        return accessInfo;
//    }
//
//    @Override
//    public Friendship getFriendshipById(Integer friendshipId, Integer userId) {
//        Friendship friendship = friendshipRepository.findById(friendshipId).orElse(null);
//        if (friendship == null) {
//            return null;
//        }
//        if (!friendship.getRequesterId().equals(userId) &&
//                !friendship.getRecipientId().equals(userId)) {
//            // Not a participant, deny access
//            throw new RuntimeException("Access denied: User is not part of this friendship");
//        }
//        return friendship;
//    }
//
//    // FriendshipServiceImpl.java
//    @Override
//    public List<Map<String, Object>> getDetailedFriends(Integer userId) throws Exception {
//        List<Friendship> friendships = getUserFriendships(userId);
//        List<Map<String, Object>> result = new ArrayList<>();
//        for (Friendship f : friendships) {
//            try {
//                // Only include if requesterAccess is not NONE
//                if (f.getRequesterId().equals(userId) && f.getRequesterAccess() == AccessLevel.NONE) {
//                    continue;
//                }
//                if (f.getRecipientId().equals(userId) && f.getRecipientAccess() == AccessLevel.NONE) {
//                    continue;
//                }
//
//                Integer friendId = f.getRequesterId().equals(userId) ? f.getRecipientId() : f.getRequesterId();
//                User friend = helper.validateUser(friendId);
//
//                Map<String, Object> map = new HashMap<>();
//                map.put("id", friend.getId());
//                map.put("name", friend.getFirstName() + " " + friend.getLastName());
//                map.put("email", friend.getEmail());
//                map.put("status", f.getStatus().name());
//                String color = "#00DAC6";
//                if (f.getStatus() == FriendshipStatus.PENDING) color = "#FFC107";
//                else if (f.getStatus() == FriendshipStatus.REJECTED) color = "#ff4d4f";
//                else if (f.getStatus() == FriendshipStatus.ACCEPTED) color = "#5b7fff";
//                map.put("color", color);
//                map.put("image", friend.getImage() != null ? friend.getImage() : "");
//                AccessLevel accessLevel = f.getRequesterId().equals(userId) ? f.getRecipientAccess() : f.getRequesterAccess();
//                map.put("accessLevel", accessLevel.name());
//                map.put("friendshipId", f.getId());
//                map.put("requesterAccess", f.getRequesterAccess().name());
//                map.put("recipientAccess", f.getRecipientAccess().name());
//                map.put("requesterUserId", f.getRequesterId());
//                map.put("recipientUserId", f.getRecipientId());
//                result.add(map);
//            } catch (Exception e) {
//                throw new RuntimeException("Error processing friend details: " + e.getMessage());
//            }
//        }
//        return result;
//    }
//
//
//    @Override
//    public Map<String, Object> getFriendshipDetails(Integer userId1, Integer userId2) throws Exception {
//        Friendship friendship = getFriendship(userId1, userId2);
//        if (friendship == null) {
//            return null;
//        }
//
//        User requester = helper.validateUser(friendship.getRequesterId());
//        User recipient = helper.validateUser(friendship.getRecipientId());
//
//        Map<String, Object> map = new HashMap<>();
//        map.put("id", friendship.getId());
//        map.put("status", friendship.getStatus().name());
//        map.put("requesterAccess", friendship.getRequesterAccess().name());
//        map.put("recipientAccess", friendship.getRecipientAccess().name());
//        boolean isRequester = friendship.getRequesterId().equals(userId1);
//        map.put("directionSwapped", !isRequester);
//
//        Map<String, Object> requesterMap = new HashMap<>();
//        requesterMap.put("id", requester.getId());
//        requesterMap.put("username", requester.getUsername());
//        requesterMap.put("email", requester.getEmail());
//        requesterMap.put("firstName", requester.getFirstName());
//        requesterMap.put("lastName", requester.getLastName());
//        requesterMap.put("image", requester.getImage());
//
//        Map<String, Object> recipientMap = new HashMap<>();
//        recipientMap.put("id", recipient.getId());
//        recipientMap.put("username", recipient.getUsername());
//        recipientMap.put("email", recipient.getEmail());
//        recipientMap.put("firstName", recipient.getFirstName());
//        recipientMap.put("lastName", recipient.getLastName());
//        recipientMap.put("image", recipient.getImage());
//
//        map.put("requester", requesterMap);
//        map.put("recipient", recipientMap);
//
//        return map;
//    }
//}