package com.jaya.service;

import com.jaya.dto.BatchShareRequestItem;
import com.jaya.models.*;
import com.jaya.repository.FriendshipRepository;
import com.jaya.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FriendshipServiceImpl implements FriendshipService {
    @Autowired
    private FriendshipRepository friendshipRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SocketService socketService;

    @Override
    public Friendship sendFriendRequest(Integer requesterId, Integer recipientId) {
        // Check if user is trying to send request to themselves
        if (requesterId.equals(recipientId)) {
            throw new RuntimeException("Cannot send friend request to yourself");
        }

        User requester = userRepository.findById(requesterId).orElseThrow(() ->
                new RuntimeException("Requester not found with ID: " + requesterId));
        User recipient = userRepository.findById(recipientId).orElseThrow(() ->
                new RuntimeException("Recipient not found with ID: " + recipientId));

        // Check if request already exists in either direction
        if (friendshipRepository.findByRequesterAndRecipient(requester, recipient).isPresent() ||
                friendshipRepository.findByRequesterAndRecipient(recipient, requester).isPresent()) {
            throw new RuntimeException("A friendship request already exists between these users");
        }

        Friendship friendship = new Friendship(null, requester, recipient, FriendshipStatus.PENDING, AccessLevel.NONE, AccessLevel.NONE);
        friendship = friendshipRepository.save(friendship);

        // Notify recipient about the new friend request
        socketService.notifyNewFriendRequest(friendship);

        return friendship;
    }

    @Override
    public Friendship respondToRequest(Integer friendshipId, Integer responderId, boolean accept) {
        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow(() ->
                new RuntimeException("Friendship request not found with ID: " + friendshipId));

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("This request has already been processed");
        }

        // Verify that the responder is the recipient of the friend request
        if (!friendship.getRecipient().getId().equals(responderId)) {
            throw new RuntimeException("Only the recipient of a friend request can respond to it");
        }

        friendship.setStatus(accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.REJECTED);

        // If accepted, set default access levels (NONE for both users)
        if (accept) {
            friendship.setRequesterAccess(AccessLevel.NONE);
            friendship.setRecipientAccess(AccessLevel.NONE);
        }

        friendship = friendshipRepository.save(friendship);

        // Notify requester about the response
        socketService.notifyFriendRequestResponse(friendship);

        return friendship;
    }

    @Override
    public Friendship setAccessLevel(Integer friendshipId, Integer userId, AccessLevel accessLevel) {
        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow(() ->
                new RuntimeException("Friendship not found with ID: " + friendshipId));

        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new RuntimeException("Cannot set access level for non-accepted friendship");
        }

        // Determine if the user is the requester or recipient and set the appropriate access level
        if (friendship.getRequester().getId().equals(userId)) {
            friendship.setRecipientAccess(accessLevel);
        } else if (friendship.getRecipient().getId().equals(userId)) {
            friendship.setRequesterAccess(accessLevel);
        } else {
            throw new RuntimeException("User is not a participant in this friendship");
        }

        return friendshipRepository.save(friendship);
    }

    @Override
    public List<Friendship> getUserFriendships(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        List<Friendship> friendships = friendshipRepository.findByRequesterOrRecipient(user, user);
        return friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .collect(Collectors.toList());
    }

    @Override
    public List<Friendship> getPendingRequests(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        List<Friendship> allFriendships = friendshipRepository.findByRequesterOrRecipient(user, user);
        return allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.PENDING)
                .collect(Collectors.toList());
    }

    @Override
    public List<Friendship> getIncomingRequests(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        return friendshipRepository.findByRecipientAndStatus(user, FriendshipStatus.PENDING);
    }

    @Override
    public List<Friendship> getOutgoingRequests(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        return friendshipRepository.findByRequesterAndStatus(user, FriendshipStatus.PENDING);
    }

    @Override
    @Transactional
    public void cancelFriendRequest(Integer friendshipId, Integer userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow(() ->
                new RuntimeException("Friendship request not found with ID: " + friendshipId));

        // Only the requester can cancel a pending request
        if (!friendship.getRequester().getId().equals(userId)) {
            throw new RuntimeException("Only the requester can cancel a friend request");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be cancelled");
        }

        friendshipRepository.delete(friendship);
    }

    @Override
    @Transactional
    public void removeFriendship(Integer friendshipId, Integer userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId).orElseThrow(() ->
                new RuntimeException("Friendship not found with ID: " + friendshipId));

        // Verify the user is part of this friendship
        if (!friendship.getRequester().getId().equals(userId) && !friendship.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("User is not part of this friendship");
        }

        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new RuntimeException("Only accepted friendships can be removed");
        }

        friendshipRepository.delete(friendship);
    }

    @Override
    @Transactional
    public void blockUser(Integer blockerId, Integer blockedId) {
        // Prevent self-blocking
        if (blockerId.equals(blockedId)) {
            throw new RuntimeException("Cannot block yourself");
        }

        User blocker = userRepository.findById(blockerId).orElseThrow(() ->
                new RuntimeException("Blocker not found with ID: " + blockerId));
        User blocked = userRepository.findById(blockedId).orElseThrow(() ->
                new RuntimeException("User to block not found with ID: " + blockedId));

        // Check if there's an existing friendship in either direction
        Optional<Friendship> existingFriendship = friendshipRepository.findByRequesterAndRecipient(blocker, blocked);
        if (existingFriendship.isEmpty()) {
            existingFriendship = friendshipRepository.findByRequesterAndRecipient(blocked, blocker);
        }

        Friendship friendship;
        if (existingFriendship.isPresent()) {
            // Update existing friendship to blocked status
            friendship = existingFriendship.get();
            friendship.setStatus(FriendshipStatus.BLOCKED);

            // Ensure the blocker is the requester in the blocked relationship
            if (!friendship.getRequester().getId().equals(blockerId)) {
                // Swap requester and recipient
                User tempRequester = friendship.getRequester();
                friendship.setRequester(friendship.getRecipient());
                friendship.setRecipient(tempRequester);

                // Reset access levels
                friendship.setRequesterAccess(AccessLevel.NONE);
                friendship.setRecipientAccess(AccessLevel.NONE);
            }
        } else {
            // Create a new blocked relationship
            friendship = new Friendship(null, blocker, blocked, FriendshipStatus.BLOCKED, AccessLevel.NONE, AccessLevel.NONE);
        }

        friendshipRepository.save(friendship);
    }

    @Override
    @Transactional
    public void unblockUser(Integer unblockerId, Integer unblockedId) {
        // Prevent self-unblocking (though this should never happen)
        if (unblockerId.equals(unblockedId)) {
            throw new RuntimeException("Cannot unblock yourself");
        }

        User unblocker = userRepository.findById(unblockerId).orElseThrow(() ->
                new RuntimeException("Unblocker not found with ID: " + unblockerId));
        User unblocked = userRepository.findById(unblockedId).orElseThrow(() ->
                new RuntimeException("User to unblock not found with ID: " + unblockedId));

        // Find the blocked relationship
        Optional<Friendship> blockedFriendship = friendshipRepository.findByRequesterAndRecipientAndStatus(
                unblocker, unblocked, FriendshipStatus.BLOCKED);

        if (blockedFriendship.isEmpty()) {
            throw new RuntimeException("No blocking relationship found between these users");
        }

        // Delete the blocked relationship
        friendshipRepository.delete(blockedFriendship.get());
    }

    @Override
    public List<User> getBlockedUsers(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        List<Friendship> blockedRelationships = friendshipRepository.findByRequesterAndStatus(user, FriendshipStatus.BLOCKED);

        return blockedRelationships.stream()
                .map(Friendship::getRecipient)
                .collect(Collectors.toList());
    }

    @Override
    public int getTotalFriendsCount(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        List<Friendship> friendships = friendshipRepository.findByRequesterOrRecipientAndStatus(
                user, user, FriendshipStatus.ACCEPTED);

        return friendships.size();
    }

    @Override
    public int getIncomingRequestsCount(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        return friendshipRepository.countByRecipientAndStatus(user, FriendshipStatus.PENDING);
    }

    @Override
    public int getOutgoingRequestsCount(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        return friendshipRepository.countByRequesterAndStatus(user, FriendshipStatus.PENDING);
    }

    @Override
    public int getBlockedUsersCount(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        return friendshipRepository.countByRequesterAndStatus(user, FriendshipStatus.BLOCKED);
    }

    @Override
    public FriendshipStatus getFriendshipStatus(Integer userId1, Integer userId2) {
        // If checking status with self, return NONE
        if (userId1.equals(userId2)) {
            return FriendshipStatus.NONE;
        }

        User user1 = userRepository.findById(userId1).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId1));
        User user2 = userRepository.findById(userId2).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId2));

        // Check for friendship in both directions
        Optional<Friendship> friendship1 = friendshipRepository.findByRequesterAndRecipient(user1, user2);
        if (friendship1.isPresent()) {
            return friendship1.get().getStatus();
        }

        Optional<Friendship> friendship2 = friendshipRepository.findByRequesterAndRecipient(user2, user1);
        if (friendship2.isPresent()) {
            return friendship2.get().getStatus();
        }

        return FriendshipStatus.NONE;
    }

    @Override
    public boolean isRequestSentByUser(Integer userId, Integer otherUserId) {
        // Cannot send request to self
        if (userId.equals(otherUserId)) {
            return false;
        }

        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));
        User otherUser = userRepository.findById(otherUserId).orElseThrow(() ->
                new RuntimeException("Other user not found with ID: " + otherUserId));

        Optional<Friendship> friendship = friendshipRepository.findByRequesterAndRecipientAndStatus(
                user, otherUser, FriendshipStatus.PENDING);

        return friendship.isPresent();
    }

    @Override
    public Friendship getFriendship(Integer userId1, Integer userId2) {
        // No friendship with self
        if (userId1.equals(userId2)) {
            return null;
        }

        User user1 = userRepository.findById(userId1).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId1));
        User user2 = userRepository.findById(userId2).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId2));

        // Check for friendship in both directions
        Optional<Friendship> friendship1 = friendshipRepository.findByRequesterAndRecipient(user1, user2);
        if (friendship1.isPresent()) {
            return friendship1.get();
        }

        Optional<Friendship> friendship2 = friendshipRepository.findByRequesterAndRecipient(user2, user1);
        if (friendship2.isPresent()) {
            return friendship2.get();
        }

        return null;
    }

    @Override
    public List<Friendship> getAllUserFriendships(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        return friendshipRepository.findByRequesterOrRecipient(user, user);
    }

    @Override
    public List<User> getFriendSuggestions(Integer userId, int limit) {
        User user = userRepository.findById(userId).orElseThrow(() ->
                new RuntimeException("User not found with ID: " + userId));

        // Get all current friends and pending requests
        List<Friendship> allRelationships = friendshipRepository.findByRequesterOrRecipient(user, user);

        // Extract all user IDs that should be excluded from suggestions
        Set<Integer> excludedUserIds = new HashSet<>();
        excludedUserIds.add(userId); // Explicitly exclude self

        for (Friendship friendship : allRelationships) {
            if (friendship.getRequester().getId().equals(userId)) {
                excludedUserIds.add(friendship.getRecipient().getId());
            } else {
                excludedUserIds.add(friendship.getRequester().getId());
            }
        }

        // Get friends of friends (for better suggestions)
        List<User> friendsOfFriends = new ArrayList<>();
        List<User> directFriends = getUserFriendships(userId).stream()
                .map(f -> f.getRequester().getId().equals(userId) ? f.getRecipient() : f.getRequester())
                .collect(Collectors.toList());

        for (User friend : directFriends) {
            List<User> friendsFriends = getUserFriendships(friend.getId()).stream()
                    .map(f -> f.getRequester().getId().equals(friend.getId()) ? f.getRecipient() : f.getRequester())
                    .filter(f -> !excludedUserIds.contains(f.getId()))
                    .collect(Collectors.toList());

            friendsOfFriends.addAll(friendsFriends);
            // Add these to excluded IDs to avoid duplicates
            friendsFriends.forEach(f -> excludedUserIds.add(f.getId()));
        }

        // If we don't have enough suggestions from friends of friends, add some random users
        if (friendsOfFriends.size() < limit) {
            List<User> randomUsers = friendshipRepository.findRandomUsers(excludedUserIds, org.springframework.data.domain.PageRequest.of(0, limit - friendsOfFriends.size()));
            friendsOfFriends.addAll(randomUsers);
        }

        // Limit the results
        if (friendsOfFriends.size() > limit) {
            return friendsOfFriends.subList(0, limit);
        }

        return friendsOfFriends;
    }

    @Override
    public List<User> getMutualFriends(Integer userId1, Integer userId2) {
        // No mutual friends with self
        if (userId1.equals(userId2)) {
            return Collections.emptyList();
        }

        // Get friends of both users
        List<User> friendsOfUser1 = getUserFriendships(userId1).stream()
                .map(f -> f.getRequester().getId().equals(userId1) ? f.getRecipient() : f.getRequester())
                .collect(Collectors.toList());

        List<User> friendsOfUser2 = getUserFriendships(userId2).stream()
                .map(f -> f.getRequester().getId().equals(userId2) ? f.getRecipient() : f.getRequester())
                .collect(Collectors.toList());

        // Find the intersection (mutual friends)
        Set<Integer> friendIds1 = friendsOfUser1.stream()
                .map(User::getId)
                .collect(Collectors.toSet());

        return friendsOfUser2.stream()
                .filter(user -> friendIds1.contains(user.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public List<User> searchFriends(Integer userId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        // Get all friends of the user
        List<User> friends = getUserFriendships(userId).stream()
                .map(f -> f.getRequester().getId().equals(userId) ? f.getRecipient() : f.getRequester())
                .collect(Collectors.toList());

        // Filter friends based on the search query
        String lowercaseQuery = query.toLowerCase();
        return friends.stream()
                .filter(friend ->
                        (friend.getFirstName() != null && friend.getFirstName().toLowerCase().contains(lowercaseQuery)) ||
                                (friend.getLastName() != null && friend.getLastName().toLowerCase().contains(lowercaseQuery)) ||
                                (friend.getUsername() != null && friend.getUsername().toLowerCase().contains(lowercaseQuery)) ||
                                (friend.getEmail() != null && friend.getEmail().toLowerCase().contains(lowercaseQuery))
                )
                .collect(Collectors.toList());
    }

    @Override
    public boolean canUserAccessExpenses(Integer ownerId, Integer viewerId) {
        // If it's the same user, they can access their own expenses
        if (ownerId.equals(viewerId)) {
            return true;
        }

        // Check if there's a friendship between the users
        Friendship friendship = getFriendship(ownerId, viewerId);
        if (friendship == null || friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            return false;
        }

        // Check the access level
        AccessLevel accessLevel = getUserAccessLevel(ownerId, viewerId);

        // READ, WRITE, FULL, LIMITED, or SUMMARY access allows viewing expenses
        return accessLevel == AccessLevel.READ ||
                accessLevel == AccessLevel.WRITE ||
                accessLevel == AccessLevel.FULL ||
                accessLevel == AccessLevel.LIMITED ||
                accessLevel == AccessLevel.SUMMARY;
    }

    @Override
    public boolean canUserModifyExpenses(Integer ownerId, Integer viewerId) {
        // If it's the same user, they can modify their own expenses
        if (ownerId.equals(viewerId)) {
            return true;
        }

        // Check if there's a friendship between the users
        Friendship friendship = getFriendship(ownerId, viewerId);
        if (friendship == null || friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            return false;
        }

        // Check the access level
        AccessLevel accessLevel = getUserAccessLevel(ownerId, viewerId);

        // Only WRITE or FULL access allows modifying expenses
        return accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL;
    }

    @Override
    public AccessLevel getUserAccessLevel(Integer ownerId, Integer viewerId) {
        // If it's the same user, they have full access to their own expenses
        if (ownerId.equals(viewerId)) {
            return AccessLevel.FULL;
        }

        // Get the friendship between the users
        Friendship friendship = getFriendship(ownerId, viewerId);
        if (friendship == null || friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            return AccessLevel.NONE;
        }

        // Determine the access level based on the friendship direction
        if (friendship.getRequester().getId().equals(ownerId)) {
            // Owner is the requester, so check what access they gave to the recipient (viewer)
            return friendship.getRecipientAccess();
        } else {
            // Owner is the recipient, so check what access they gave to the requester (viewer)
            return friendship.getRequesterAccess();
        }
    }

    @Override
    public void updateFriendship(Friendship friendship) {
        if (friendship == null) {
            throw new RuntimeException("Friendship cannot be null");
        }

        // Verify the friendship exists
        friendshipRepository.findById(friendship.getId())
                .orElseThrow(() -> new RuntimeException("Friendship not found with ID: " + friendship.getId()));

        friendshipRepository.save(friendship);
    }

    @Override
    public List<String> batchShareExpenses(Integer userId, List<BatchShareRequestItem> requests) {
        List<String> results = new ArrayList<>();
        for (BatchShareRequestItem item : requests) {
            try {
                Integer targetUserId = item.getUserId();

                // Prevent sharing with self
                if (userId.equals(targetUserId)) {
                    results.add("User ID " + targetUserId + ": Cannot share expenses with yourself");
                    continue;
                }

                AccessLevel accessLevel = AccessLevel.valueOf(item.getAccessLevel());

                Friendship friendship = getFriendship(userId, targetUserId);
                if (friendship != null && friendship.getStatus() == FriendshipStatus.ACCEPTED) {
                    if (friendship.getRequester().getId().equals(userId)) {
                        friendship.setRecipientAccess(accessLevel);
                    } else {
                        friendship.setRequesterAccess(accessLevel);
                    }
                    updateFriendship(friendship);
                    results.add("User ID " + targetUserId + ": Access updated to " + accessLevel);
                } else {
                    results.add("User ID " + targetUserId + ": No active friendship found");
                }
            } catch (Exception e) {
                results.add("User ID " + item.getUserId() + ": Error - " + e.getMessage());
            }
        }
        return results;
    }

    @Override
    public List<Map<String, Object>> getRecommendedToShare(Integer userId) {
        List<Friendship> friendships = getUserFriendships(userId);
        List<Map<String, Object>> recommendations = friendships.stream()
                .filter(f -> {
                    AccessLevel accessLevel;
                    if (f.getRequester().getId().equals(userId)) {
                        accessLevel = f.getRecipientAccess();
                    } else {
                        accessLevel = f.getRequesterAccess();
                    }
                    return accessLevel == AccessLevel.NONE;
                })
                .map(f -> {
                    User friend = f.getRequester().getId().equals(userId)
                            ? f.getRecipient() : f.getRequester();

                    Map<String, Object> friendInfo = new HashMap<>();
                    friendInfo.put("userId", friend.getId());
                    friendInfo.put("name", friend.getFirstName() + " " + friend.getLastName());
                    friendInfo.put("username", friend.getUsername());
                    friendInfo.put("email", friend.getEmail());

                    AccessLevel theirAccessLevel = getUserAccessLevel(friend.getId(), userId);
                    friendInfo.put("theySharedWithYou", theirAccessLevel != AccessLevel.NONE);

                    return friendInfo;
                })
                .collect(Collectors.toList());
        return recommendations;
    }

    @Override
    public Map<String, Object> getExpenseSharingSummary(Integer userId) {
        List<Friendship> friendships = getUserFriendships(userId);

        int totalFriends = friendships.size();
        int sharedWithCount = 0;
        int sharedWithMeCount = 0;
        int mutualSharingCount = 0;

        for (Friendship friendship : friendships) {
            boolean iShareWithThem = false;
            boolean theyShareWithMe = false;

            if (friendship.getRequester().getId().equals(userId)) {
                iShareWithThem = friendship.getRecipientAccess() != AccessLevel.NONE;
                theyShareWithMe = friendship.getRequesterAccess() != AccessLevel.NONE;
            } else {
                iShareWithThem = friendship.getRequesterAccess() != AccessLevel.NONE;
                theyShareWithMe = friendship.getRecipientAccess() != AccessLevel.NONE;
            }

            if (iShareWithThem) sharedWithCount++;
            if (theyShareWithMe) sharedWithMeCount++;
            if (iShareWithThem && theyShareWithMe) mutualSharingCount++;
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFriends", totalFriends);
        summary.put("sharedWithCount", sharedWithCount);
        summary.put("sharedWithMeCount", sharedWithMeCount);
        summary.put("mutualSharingCount", mutualSharingCount);
        summary.put("notSharingCount", totalFriends - (sharedWithCount + sharedWithMeCount - mutualSharingCount));

        return summary;
    }

    @Override
    public Map<String, Object> quickShareExpenses(Integer currentUserId, Integer targetUserId, AccessLevel accessLevel) {
        // Prevent sharing with self
        if (currentUserId.equals(targetUserId)) {
            throw new RuntimeException("Cannot share expenses with yourself");
        }

        Friendship friendship = getFriendship(currentUserId, targetUserId);
        if (friendship == null) {
            throw new RuntimeException("No friendship exists with this user");
        }
        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new RuntimeException("Cannot share with a user who is not an accepted friend");
        }

        if (friendship.getRequester().getId().equals(currentUserId)) {
            friendship.setRecipientAccess(accessLevel);
        } else {
            friendship.setRequesterAccess(accessLevel);
        }

        updateFriendship(friendship);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Access level updated successfully");
        result.put("accessLevel", accessLevel);
        return result;
    }

    @Override
    public List<Map<String, Object>> getSharedWithMe(Integer userId) {
        List<Friendship> friendships = getUserFriendships(userId);
        return friendships.stream()
                .filter(f -> {
                    AccessLevel accessLevel;
                    if (f.getRequester().getId().equals(userId)) {
                        accessLevel = f.getRequesterAccess();
                    } else {
                        accessLevel = f.getRecipientAccess();
                    }
                    return accessLevel != AccessLevel.NONE;
                })
                .map(f -> {
                    User friend = f.getRequester().getId().equals(userId)
                            ? f.getRecipient() : f.getRequester();
                    AccessLevel accessLevel = getUserAccessLevel(friend.getId(), userId);

                    Map<String, Object> shareInfo = new HashMap<>();
                    shareInfo.put("userId", friend.getId());
                    shareInfo.put("name", friend.getFirstName() + " " + friend.getLastName());
                    shareInfo.put("username", friend.getUsername());
                    shareInfo.put("email", friend.getEmail());
                    shareInfo.put("accessLevel", accessLevel);
                    shareInfo.put("canModify", accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL);

                    return shareInfo;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getISharedWith(Integer userId) {
        List<Friendship> friendships = getUserFriendships(userId);
        return friendships.stream()
                .filter(f -> {
                    AccessLevel accessLevel;
                    if (f.getRequester().getId().equals(userId)) {
                        accessLevel = f.getRecipientAccess();
                    } else {
                        accessLevel = f.getRequesterAccess();
                    }
                    return accessLevel != AccessLevel.NONE;
                })
                .map(f -> {
                    User friend = f.getRequester().getId().equals(userId)
                            ? f.getRecipient() : f.getRequester();
                    AccessLevel accessLevel = getUserAccessLevel(userId, friend.getId());

                    Map<String, Object> shareInfo = new HashMap<>();
                    shareInfo.put("userId", friend.getId());
                    shareInfo.put("name", friend.getFirstName() + " " + friend.getLastName());
                    shareInfo.put("username", friend.getUsername());
                    shareInfo.put("email", friend.getEmail());
                    shareInfo.put("accessLevel", accessLevel);
                    shareInfo.put("canModify", accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL);

                    return shareInfo;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getExpenseAccessInfo(Integer ownerId, Integer viewerId) {
        Map<String, Object> accessInfo = new HashMap<>();
        accessInfo.put("canView", canUserAccessExpenses(ownerId, viewerId));
        accessInfo.put("canModify", canUserModifyExpenses(ownerId, viewerId));
        accessInfo.put("accessLevel", getUserAccessLevel(ownerId, viewerId));
        return accessInfo;
    }

    @Override
    public Friendship getFriendshipById(Integer friendshipId, Integer userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId).orElse(null);
        if (friendship == null) {
            return null;
        }
        if (!friendship.getRequester().getId().equals(userId) &&
                !friendship.getRecipient().getId().equals(userId)) {
            // Not a participant, deny access
            throw new RuntimeException("Access denied: User is not part of this friendship");
        }
        return friendship;
    }

    // FriendshipServiceImpl.java
    @Override
    public List<Map<String, Object>> getDetailedFriends(Integer userId) {
        List<Friendship> friendships = getUserFriendships(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Friendship f : friendships) {
            // Only include if requesterAccess is not NONE
            if (f.getRequesterAccess() == AccessLevel.NONE) {
                continue;
            }
            User friend = f.getRequester().getId().equals(userId) ? f.getRecipient() : f.getRequester();
            Map<String, Object> map = new HashMap<>();
            map.put("id", friend.getId());
            map.put("name", friend.getFirstName() + " " + friend.getLastName());
            map.put("email", friend.getEmail());
            map.put("status", f.getStatus().name());
            String color = "#00DAC6";
            if (f.getStatus() == FriendshipStatus.PENDING) color = "#FFC107";
            else if (f.getStatus() == FriendshipStatus.REJECTED) color = "#ff4d4f";
            else if (f.getStatus() == FriendshipStatus.ACCEPTED) color = "#5b7fff";
            map.put("color", color);
            map.put("image", friend.getImage() != null ? friend.getImage() : "");
            AccessLevel accessLevel = f.getRequester().getId().equals(userId) ? f.getRecipientAccess() : f.getRequesterAccess();
            map.put("accessLevel", accessLevel.name());
            map.put("friendshipId", f.getId());
            map.put("requesterAccess", f.getRequesterAccess().name());
            map.put("recipientAccess", f.getRecipientAccess().name());
            map.put("requesterUserId", f.getRequester().getId());
            map.put("recipientUserId", f.getRecipient().getId());
            result.add(map);
        }
        return result;
    }


    @Override
    public Map<String, Object> getFriendshipDetails(Integer userId1, Integer userId2) {
        Friendship friendship = getFriendship(userId1, userId2);
        if (friendship == null) {
            return null; // Or throw an exception if you prefer
        }
        Map<String, Object> map = new HashMap<>();
        map.put("id", friendship.getId());
        map.put("status", friendship.getStatus().name());
        map.put("requesterAccess", friendship.getRequesterAccess().name());
        map.put("recipientAccess", friendship.getRecipientAccess().name());
        boolean isRequester = friendship.getRequester().getId().equals(userId1);
        map.put("directionSwapped", isRequester );

        Map<String, Object> requester = new HashMap<>();
        requester.put("id", friendship.getRequester().getId());
        requester.put("username", friendship.getRequester().getUsername());
        requester.put("email", friendship.getRequester().getEmail());
        requester.put("firstName", friendship.getRequester().getFirstName());
        requester.put("lastName", friendship.getRequester().getLastName());
        requester.put("image", friendship.getRequester().getImage());

        Map<String, Object> recipient = new HashMap<>();
        recipient.put("id", friendship.getRecipient().getId());
        recipient.put("username", friendship.getRecipient().getUsername());
        recipient.put("email", friendship.getRecipient().getEmail());
        recipient.put("firstName", friendship.getRecipient().getFirstName());
        recipient.put("lastName", friendship.getRecipient().getLastName());
        recipient.put("image", friendship.getRecipient().getImage());

        map.put("requester", requester);
        map.put("recipient", recipient);

        return map;
    }
}