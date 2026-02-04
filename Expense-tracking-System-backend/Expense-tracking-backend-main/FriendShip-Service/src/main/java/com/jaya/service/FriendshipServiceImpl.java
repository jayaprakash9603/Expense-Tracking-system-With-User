package com.jaya.service;

import com.jaya.dto.BatchShareRequestItem;
import com.jaya.dto.FriendshipReportDTO;
import com.jaya.kafka.service.UnifiedActivityService;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.UserDto;
import com.jaya.repository.FriendshipRepository;
import com.jaya.util.ServiceHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FriendshipServiceImpl implements FriendshipService {
    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private ServiceHelper helper;

    @Autowired
    private UserService userService;

    @Autowired
    private UnifiedActivityService unifiedActivityService;
    // @Autowired
    // private SocketService socketService;

    @Override
    public Friendship sendFriendRequest(Integer requesterId, Integer recipientId) throws Exception {
        // Check if user is trying to send request to themselves
        if (requesterId.equals(recipientId)) {
            throw new RuntimeException("Cannot send friend request to yourself");
        }

        UserDto requester = helper.validateUser(requesterId);
        UserDto recipient = helper.validateUser(recipientId);

        // Check if request already exists in either direction
        if (friendshipRepository.findByRequesterIdAndRecipientId(requester.getId(), recipient.getId()).isPresent() ||
                friendshipRepository.findByRequesterIdAndRecipientId(recipient.getId(), requester.getId())
                        .isPresent()) {
            throw new RuntimeException("A friendship request already exists between these users");
        }

        Friendship friendship = Friendship.builder()
                .requesterId(requester.getId())
                .recipientId(recipient.getId())
                .status(FriendshipStatus.PENDING)
                .requesterAccess(AccessLevel.NONE)
                .recipientAccess(AccessLevel.NONE)
                .build();
        friendship = friendshipRepository.save(friendship);

        // Send unified event for friend request sent (handles audit + notification)
        unifiedActivityService.sendFriendRequestSentEvent(friendship, requester, recipient);

        // Notify recipient about the new friend request
        // socketService.notifyNewFriendRequest(friendship);

        return friendship;
    }

    @Override
    @CacheEvict(value = { "friendships", "friendshipStatus", "accessLevels" }, allEntries = true)
    public Friendship respondToRequest(Integer friendshipId, Integer responderId, boolean accept) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship request not found with ID: " + friendshipId));

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("This request has already been processed");
        }

        // Verify that the responder is the recipient of the friend request
        if (!friendship.getRecipientId().equals(responderId)) {
            throw new RuntimeException("Only the recipient of a friend request can respond to it");
        }

        friendship.setStatus(accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.REJECTED);

        // If accepted, set default access levels (NONE for both users)
        if (accept) {
            friendship.setRequesterAccess(AccessLevel.NONE);
            friendship.setRecipientAccess(AccessLevel.NONE);
        }

        friendship = friendshipRepository.save(friendship);

        // Send unified event for friend request response (handles audit + notification)
        try {
            UserDto requester = helper.validateUser(friendship.getRequesterId());
            UserDto recipient = helper.validateUser(friendship.getRecipientId());

            if (accept) {
                unifiedActivityService.sendFriendRequestAcceptedEvent(friendship, requester, recipient);
            } else {
                unifiedActivityService.sendFriendRequestRejectedEvent(friendship, requester, recipient);
            }
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to send friend request response event: " + e.getMessage());
        }

        // Notify requester about the response
        // socketService.notifyFriendRequestResponse(friendship);

        return friendship;
    }

    @Override
    @CacheEvict(value = { "friendships", "friendshipStatus", "accessLevels" }, allEntries = true)
    public Friendship setAccessLevel(Integer friendshipId, Integer userId, AccessLevel accessLevel) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found with ID: " + friendshipId));

        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new RuntimeException("Cannot set access level for non-accepted friendship");
        }

        // Store old access level for notification
        AccessLevel oldAccess = null;
        Integer otherUserId = null;

        // Determine if the user is the requester or recipient and set the appropriate
        // access level
        if (friendship.getRequesterId().equals(userId)) {
            oldAccess = friendship.getRecipientAccess();
            friendship.setRecipientAccess(accessLevel);
            otherUserId = friendship.getRecipientId();
        } else if (friendship.getRecipientId().equals(userId)) {
            oldAccess = friendship.getRequesterAccess();
            friendship.setRequesterAccess(accessLevel);
            otherUserId = friendship.getRequesterId();
        } else {
            throw new RuntimeException("User is not a participant in this friendship");
        }

        Friendship savedFriendship = friendshipRepository.save(friendship);

        // Send unified event for access level change (handles audit + notification)
        try {
            UserDto changer = helper.validateUser(userId);
            UserDto targetUser = helper.validateUser(otherUserId);
            unifiedActivityService.sendAccessLevelChangedEvent(
                    savedFriendship, changer, targetUser, oldAccess, accessLevel);
        } catch (Exception e) {
            System.err.println("Failed to send access level changed event: " + e.getMessage());
        }

        return savedFriendship;
    }

    @Override
    public List<Friendship> getUserFriendships(Integer userId) throws Exception {
        UserDto user = helper.validateUser(userId);

        List<Friendship> friendships = friendshipRepository.findByRequesterIdOrRecipientId(user.getId());
        return friendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .collect(Collectors.toList());
    }

    @Override
    public List<Friendship> getPendingRequests(Integer userId) throws Exception {
        UserDto user = helper.validateUser(userId);

        List<Friendship> allFriendships = friendshipRepository.findByRequesterIdOrRecipientId(user.getId());
        return allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.PENDING)
                .collect(Collectors.toList());
    }

    @Override
    public List<Friendship> getIncomingRequests(Integer userId) throws Exception {
        UserDto user = helper.validateUser(userId);

        return friendshipRepository.findByRecipientIdAndStatus(user.getId(), FriendshipStatus.PENDING);
    }

    @Override
    public List<Friendship> getOutgoingRequests(Integer userId) throws Exception {
        UserDto user = helper.validateUser(userId);

        return friendshipRepository.findByRequesterIdAndStatus(user.getId(), FriendshipStatus.PENDING);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "friendships", "friendshipStatus", "accessLevels" }, allEntries = true)
    public void cancelFriendRequest(Integer friendshipId, Integer userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship request not found with ID: " + friendshipId));

        // Only the requester can cancel a pending request
        if (!friendship.getRequesterId().equals(userId)) {
            throw new RuntimeException("Only the requester can cancel a friend request");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be cancelled");
        }

        // Send unified event for friend request cancelled before deleting
        try {
            UserDto canceller = helper.validateUser(userId);
            UserDto recipient = helper.validateUser(friendship.getRecipientId());
            unifiedActivityService.sendFriendRequestCancelledEvent(friendship, canceller, recipient);
        } catch (Exception e) {
            System.err.println("Failed to send friend request cancelled event: " + e.getMessage());
        }

        friendshipRepository.delete(friendship);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "friendships", "friendshipStatus", "accessLevels" }, allEntries = true)
    public void removeFriendship(Integer friendshipId, Integer userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found with ID: " + friendshipId));

        // Verify the user is part of this friendship
        if (!friendship.getRequesterId().equals(userId) && !friendship.getRecipientId().equals(userId)) {
            throw new RuntimeException("User is not part of this friendship");
        }

        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new RuntimeException("Only accepted friendships can be removed");
        }

        // Determine the other user ID
        Integer otherUserId = friendship.getRequesterId().equals(userId)
                ? friendship.getRecipientId()
                : friendship.getRequesterId();

        // Send unified event for friendship removed before deleting
        try {
            UserDto remover = helper.validateUser(userId);
            UserDto removedUser = helper.validateUser(otherUserId);
            unifiedActivityService.sendFriendRemovedEvent(friendship, remover, removedUser);
        } catch (Exception e) {
            System.err.println("Failed to send friendship removed event: " + e.getMessage());
        }

        friendshipRepository.delete(friendship);
    }

    @Override
    @Transactional
    public void blockUser(Integer blockerId, Integer blockedId) throws Exception {
        // Prevent self-blocking
        if (blockerId.equals(blockedId)) {
            throw new RuntimeException("Cannot block yourself");
        }

        UserDto blocker = helper.validateUser(blockerId);
        UserDto blocked = helper.validateUser(blockedId);

        // Check if there's an existing friendship in either direction
        Optional<Friendship> existingFriendship = friendshipRepository.findByRequesterIdAndRecipientId(blocker.getId(),
                blocked.getId());
        if (existingFriendship.isEmpty()) {
            existingFriendship = friendshipRepository.findByRequesterIdAndRecipientId(blocked.getId(), blocker.getId());
        }

        Friendship friendship;
        if (existingFriendship.isPresent()) {
            // Update existing friendship to blocked status
            friendship = existingFriendship.get();
            friendship.setStatus(FriendshipStatus.BLOCKED);

            // Ensure the blocker is the requester in the blocked relationship
            if (!friendship.getRequesterId().equals(blockerId)) {
                // Swap requester and recipient
                Integer tempRequester = friendship.getRequesterId();
                friendship.setRequesterId(friendship.getRecipientId());
                friendship.setRecipientId(tempRequester);

                // Reset access levels
                friendship.setRequesterAccess(AccessLevel.NONE);
                friendship.setRecipientAccess(AccessLevel.NONE);
            }
        } else {
            // Create a new blocked relationship
            friendship = Friendship.builder()
                    .requesterId(blocker.getId())
                    .recipientId(blocked.getId())
                    .status(FriendshipStatus.BLOCKED)
                    .requesterAccess(AccessLevel.NONE)
                    .recipientAccess(AccessLevel.NONE)
                    .build();
        }

        friendshipRepository.save(friendship);

        // Note: Typically we don't notify blocked users for privacy/security reasons
        // Uncomment below if you want to send notifications
        // friendshipNotificationService.sendUserBlockedNotification(friendship.getId(),
        // blocker, blockedId);
    }

    @Override
    @Transactional
    public void unblockUser(Integer unblockerId, Integer unblockedId) throws Exception {
        // Prevent self-unblocking (though this should never happen)
        if (unblockerId.equals(unblockedId)) {
            throw new RuntimeException("Cannot unblock yourself");
        }

        UserDto unblocker = helper.validateUser(unblockerId);
        UserDto unblocked = helper.validateUser(unblockedId);

        // Find the blocked relationship
        Optional<Friendship> blockedFriendship = friendshipRepository.findByRequesterIdAndRecipientIdAndStatus(
                unblocker.getId(), unblocked.getId(), FriendshipStatus.BLOCKED);

        if (blockedFriendship.isEmpty()) {
            throw new RuntimeException("No blocking relationship found between these users");
        }

        Friendship friendship = blockedFriendship.get();

        // Send unified event for user unblocked (for audit purposes)
        unifiedActivityService.sendUserUnblockedEvent(unblocker, unblocked);

        // Delete the blocked relationship
        friendshipRepository.delete(friendship);
    }

    @Override
    public List<UserDto> getBlockedUsers(Integer userId) throws Exception {
        helper.validateUser(userId);

        List<Friendship> blockedRelationships = friendshipRepository.findByRequesterIdAndStatus(userId,
                FriendshipStatus.BLOCKED);

        return blockedRelationships.stream()
                .map(friendship -> {
                    try {
                        return helper.validateUser(friendship.getRecipientId());
                    } catch (Exception e) {
                        throw new RuntimeException("Error retrieving blocked user: " + e.getMessage());
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public int getTotalFriendsCount(Integer userId) throws Exception {
        helper.validateUser(userId);

        List<Friendship> friendships = friendshipRepository.findByRequesterIdOrRecipientIdAndStatus(
                userId, FriendshipStatus.ACCEPTED);

        return friendships.size();
    }

    @Override
    public int getIncomingRequestsCount(Integer userId) throws Exception {
        helper.validateUser(userId);

        return friendshipRepository.countByRecipientIdAndStatus(userId, FriendshipStatus.PENDING);
    }

    @Override
    public int getOutgoingRequestsCount(Integer userId) throws Exception {
        helper.validateUser(userId);

        return friendshipRepository.countByRequesterIdAndStatus(userId, FriendshipStatus.PENDING);
    }

    @Override
    public int getBlockedUsersCount(Integer userId) throws Exception {
        helper.validateUser(userId);

        return friendshipRepository.countByRequesterIdAndStatus(userId, FriendshipStatus.BLOCKED);
    }

    @Override
    public FriendshipStatus getFriendshipStatus(Integer userId1, Integer userId2) throws Exception {
        // If checking status with self, return NONE
        if (userId1.equals(userId2)) {
            return FriendshipStatus.NONE;
        }

        UserDto user1 = helper.validateUser(userId1);
        UserDto user2 = helper.validateUser(userId2);

        // OPTIMIZED: Single bidirectional query instead of two separate queries
        Optional<Friendship> friendship = friendshipRepository.findBidirectional(user1.getId(), user2.getId());
        return friendship.map(Friendship::getStatus).orElse(FriendshipStatus.NONE);
    }

    @Override
    public boolean isRequestSentByUser(Integer userId, Integer otherUserId) throws Exception {
        // Cannot send request to self
        if (userId.equals(otherUserId)) {
            return false;
        }

        UserDto user = helper.validateUser(userId);
        UserDto otherUser = helper.validateUser(otherUserId);

        Optional<Friendship> friendship = friendshipRepository.findByRequesterIdAndRecipientIdAndStatus(
                user.getId(), otherUser.getId(), FriendshipStatus.PENDING);

        return friendship.isPresent();
    }

    @Override
    public boolean areFriends(Integer userId1, Integer userId2) throws Exception {
        try {
            Friendship friendship = getFriendship(userId1, userId2);
            return friendship != null && friendship.getStatus() == FriendshipStatus.ACCEPTED;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Cacheable(value = "friendships", key = "#userId1 + '-' + #userId2", unless = "#result == null")
    public Friendship getFriendship(Integer userId1, Integer userId2) throws Exception {
        // No friendship with self
        if (userId1.equals(userId2)) {
            return null;
        }

        UserDto user1 = helper.validateUser(userId1);
        UserDto user2 = helper.validateUser(userId2);

        // OPTIMIZED: Single bidirectional query instead of two separate queries
        return friendshipRepository.findBidirectional(user1.getId(), user2.getId()).orElse(null);
    }

    @Override
    public List<Friendship> getAllUserFriendships(Integer userId) throws Exception {
        UserDto user = helper.validateUser(userId);

        return friendshipRepository.findByRequesterIdOrRecipientId(user.getId());
    }

    @Override
    public List<UserDto> getFriendSuggestions(Integer userId, int limit) throws Exception {
        helper.validateUser(userId);

        // Get all current friends and pending requests
        List<Friendship> allRelationships = friendshipRepository.findByRequesterIdOrRecipientId(userId);

        // Extract all user IDs that should be excluded from suggestions
        Set<Integer> excludedUserIds = new HashSet<>();
        excludedUserIds.add(userId); // Explicitly exclude self

        for (Friendship friendship : allRelationships) {
            if (friendship.getRequesterId().equals(userId)) {
                excludedUserIds.add(friendship.getRecipientId());
            } else {
                excludedUserIds.add(friendship.getRequesterId());
            }
        }

        // Get friends of friends (for better suggestions)
        List<UserDto> friendsOfFriends = new ArrayList<>();
        List<Friendship> userFriendships = getUserFriendships(userId);

        for (Friendship friendship : userFriendships) {
            try {
                Integer friendId = friendship.getRequesterId().equals(userId) ? friendship.getRecipientId()
                        : friendship.getRequesterId();

                UserDto friend = helper.validateUser(friendId);

                // Get friend's friendships
                List<Friendship> friendFriendships = getUserFriendships(friend.getId());

                for (Friendship friendFriendship : friendFriendships) {
                    try {
                        Integer friendFriendId = friendFriendship.getRequesterId().equals(friend.getId())
                                ? friendFriendship.getRecipientId()
                                : friendFriendship.getRequesterId();

                        // Check if this user should be excluded
                        if (!excludedUserIds.contains(friendFriendId)) {
                            UserDto friendOfFriend = helper.validateUser(friendFriendId);
                            friendsOfFriends.add(friendOfFriend);
                            excludedUserIds.add(friendFriendId); // Avoid duplicates
                        }
                    } catch (Exception e) {
                        // Log and skip this friend's friend
                        System.err.println("Error retrieving friend's friend: " + e.getMessage());
                    }
                }
            } catch (Exception e) {
                // Log and skip this friend
                System.err.println("Error retrieving friend: " + e.getMessage());
            }
        }

        // If we don't have enough suggestions from friends of friends, get random users
        if (friendsOfFriends.size() < limit) {
            int remainingCount = limit - friendsOfFriends.size();
            List<UserDto> randomUsers = getRandomUsersExcluding(excludedUserIds, remainingCount);
            friendsOfFriends.addAll(randomUsers);
        }

        // Limit the results
        if (friendsOfFriends.size() > limit) {
            return friendsOfFriends.subList(0, limit);
        }

        return friendsOfFriends;
    }

    private List<UserDto> getRandomUsersExcluding(Set<Integer> excludedUserIds, int count) {
        List<UserDto> randomUsers = new ArrayList<>();

        try {
            // Get all users from the user service instead of just from friendship table
            List<UserDto> allUsers = userService.getAllUsers(); // You'll need to implement this method

            // Filter out excluded users
            List<UserDto> availableUsers = allUsers.stream()
                    .filter(user -> !excludedUserIds.contains(user.getId()))
                    .collect(Collectors.toList());

            // Shuffle the list for randomness
            Collections.shuffle(availableUsers);

            // Get the required number of users
            int usersToGet = Math.min(count, availableUsers.size());

            for (int i = 0; i < usersToGet; i++) {
                randomUsers.add(availableUsers.get(i));
            }

        } catch (Exception e) {
            System.err.println("Error getting random users: " + e.getMessage());

            // Fallback: try the original approach if the new method fails
            try {
                List<Friendship> allFriendships = friendshipRepository.findAll();
                Set<Integer> uniqueUserIds = new HashSet<>();

                for (Friendship friendship : allFriendships) {
                    uniqueUserIds.add(friendship.getRequesterId());
                    uniqueUserIds.add(friendship.getRecipientId());
                }

                List<Integer> availableUserIds = new ArrayList<>();
                for (Integer userId : uniqueUserIds) {
                    if (!excludedUserIds.contains(userId)) {
                        availableUserIds.add(userId);
                    }
                }

                Collections.shuffle(availableUserIds);
                int usersToGet = Math.min(count, availableUserIds.size());

                for (int i = 0; i < usersToGet; i++) {
                    try {
                        UserDto user = helper.validateUser(availableUserIds.get(i));
                        randomUsers.add(user);
                    } catch (Exception ex) {
                        System.err.println("Error validating user " + availableUserIds.get(i) + ": " + ex.getMessage());
                    }
                }
            } catch (Exception fallbackException) {
                System.err.println("Fallback method also failed: " + fallbackException.getMessage());
            }
        }

        return randomUsers;
    }

    @Override
    public List<UserDto> getMutualFriends(Integer userId1, Integer userId2) throws Exception {
        // No mutual friends with self
        if (userId1.equals(userId2)) {
            return Collections.emptyList();
        }

        // Get friends of both users
        List<Integer> friendsOfUser1 = getUserFriendships(userId1).stream()
                .map(f -> f.getRequesterId().equals(userId1) ? f.getRecipientId() : f.getRequesterId())
                .collect(Collectors.toList());

        List<Integer> friendsOfUser2 = getUserFriendships(userId2).stream()
                .map(f -> f.getRequesterId().equals(userId2) ? f.getRecipientId() : f.getRequesterId())
                .collect(Collectors.toList());

        // Find the intersection (mutual friends)
        Set<UserDto> friendIds1 = friendsOfUser1.stream()
                .map(e -> {
                    try {
                        return helper.validateUser(e);
                    } catch (Exception ex) {
                        throw new RuntimeException(ex);
                    }
                })
                .collect(Collectors.toSet());

        Set<UserDto> friendIds2 = friendsOfUser2.stream()
                .map(e -> {
                    try {
                        return helper.validateUser(e);
                    } catch (Exception ex) {
                        throw new RuntimeException(ex);
                    }
                })
                .collect(Collectors.toSet());

        // FIXED: Use contains() to check if the user exists in the set
        return friendIds2.stream()
                .filter(user -> friendIds1.contains(user)) // ✅ CORRECT: Check if the set contains the user
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> searchFriends(Integer userId, String query) throws Exception {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        // Get all friends of the user
        List<Integer> friends = getUserFriendships(userId).stream()
                .map(f -> f.getRequesterId().equals(userId) ? f.getRecipientId() : f.getRequesterId())
                .collect(Collectors.toList());

        List<UserDto> users = friends.stream().map(e -> {
            try {
                return helper.validateUser(e);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
        }).collect(Collectors.toList());
        // Filter friends based on the search query
        String lowercaseQuery = query.toLowerCase();
        return users.stream()
                .filter(friend -> (friend.getFirstName() != null
                        && friend.getFirstName().toLowerCase().contains(lowercaseQuery)) ||
                        (friend.getLastName() != null && friend.getLastName().toLowerCase().contains(lowercaseQuery)) ||
                        (friend.getUsername() != null && friend.getUsername().toLowerCase().contains(lowercaseQuery)) ||
                        (friend.getEmail() != null && friend.getEmail().toLowerCase().contains(lowercaseQuery)))
                .collect(Collectors.toList());
    }

    @Override
    public boolean canUserAccessExpenses(Integer ownerId, Integer viewerId) throws Exception {
        // If it's the same user, they can access their own expenses
        if (ownerId.equals(viewerId)) {
            return true;
        }

        // OPTIMIZED: Use bidirectional query with status filter to get accepted
        // friendship in one query
        Optional<Friendship> friendshipOpt = friendshipRepository.findBidirectionalByStatus(
                ownerId, viewerId, FriendshipStatus.ACCEPTED);

        if (friendshipOpt.isEmpty()) {
            return false;
        }

        Friendship friendship = friendshipOpt.get();

        // Determine the access level based on the friendship direction
        AccessLevel accessLevel;
        if (friendship.getRequesterId().equals(ownerId)) {
            accessLevel = friendship.getRecipientAccess();
        } else {
            accessLevel = friendship.getRequesterAccess();
        }

        // READ, WRITE, FULL, LIMITED, or SUMMARY access allows viewing expenses
        return accessLevel == AccessLevel.READ ||
                accessLevel == AccessLevel.WRITE ||
                accessLevel == AccessLevel.FULL ||
                accessLevel == AccessLevel.LIMITED ||
                accessLevel == AccessLevel.SUMMARY;
    }

    @Override
    public boolean canUserModifyExpenses(Integer ownerId, Integer viewerId) throws Exception {
        // If it's the same user, they can modify their own expenses
        if (ownerId.equals(viewerId)) {
            return true;
        }

        // OPTIMIZED: Use bidirectional query with status filter to get accepted
        // friendship in one query
        Optional<Friendship> friendshipOpt = friendshipRepository.findBidirectionalByStatus(
                ownerId, viewerId, FriendshipStatus.ACCEPTED);

        if (friendshipOpt.isEmpty()) {
            return false;
        }

        Friendship friendship = friendshipOpt.get();

        // Determine the access level based on the friendship direction
        AccessLevel accessLevel;
        if (friendship.getRequesterId().equals(ownerId)) {
            accessLevel = friendship.getRecipientAccess();
        } else {
            accessLevel = friendship.getRequesterAccess();
        }

        // Only WRITE or FULL access allows modifying expenses
        return accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL;
    }

    @Override
    public AccessLevel getUserAccessLevel(Integer ownerId, Integer viewerId) throws Exception {
        // If it's the same user, they have full access to their own expenses
        if (ownerId.equals(viewerId)) {
            return AccessLevel.FULL;
        }

        // OPTIMIZED: Use bidirectional query with status filter to get accepted
        // friendship in one query
        Optional<Friendship> friendshipOpt = friendshipRepository.findBidirectionalByStatus(
                ownerId, viewerId, FriendshipStatus.ACCEPTED);

        if (friendshipOpt.isEmpty()) {
            return AccessLevel.NONE;
        }

        Friendship friendship = friendshipOpt.get();

        // Determine the access level based on the friendship direction
        if (friendship.getRequesterId().equals(ownerId)) {
            // Owner is the requester, so check what access they gave to the recipient
            // (viewer)
            return friendship.getRecipientAccess();
        } else {
            // Owner is the recipient, so check what access they gave to the requester
            // (viewer)
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
                    if (friendship.getRequesterId().equals(userId)) {
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
    public List<Map<String, Object>> getRecommendedToShare(Integer userId) throws Exception {
        List<Friendship> friendships = getUserFriendships(userId);
        List<Map<String, Object>> recommendations = friendships.stream()
                .filter(f -> {
                    AccessLevel accessLevel;
                    if (f.getRequesterId().equals(userId)) {
                        accessLevel = f.getRecipientAccess();
                    } else {
                        accessLevel = f.getRequesterAccess();
                    }
                    return accessLevel == AccessLevel.NONE;
                })
                .map(f -> {
                    try {
                        Integer friendId = f.getRequesterId().equals(userId)
                                ? f.getRecipientId()
                                : f.getRequesterId();
                        UserDto friend = helper.validateUser(friendId);

                        Map<String, Object> friendInfo = new HashMap<>();
                        friendInfo.put("userId", friend.getId());
                        friendInfo.put("name", friend.getFirstName() + " " + friend.getLastName());
                        friendInfo.put("username", friend.getUsername());
                        friendInfo.put("email", friend.getEmail());

                        AccessLevel theirAccessLevel = getUserAccessLevel(friend.getId(), userId);
                        friendInfo.put("theySharedWithYou", theirAccessLevel != AccessLevel.NONE);

                        return friendInfo;
                    } catch (Exception e) {
                        throw new RuntimeException("Error processing friend recommendation: " + e.getMessage());
                    }
                })
                .collect(Collectors.toList());
        return recommendations;
    }

    @Override
    public Map<String, Object> getExpenseSharingSummary(Integer userId) throws Exception {
        helper.validateUser(userId);

        List<Friendship> friendships = getUserFriendships(userId);

        int totalFriends = friendships.size();
        int sharedWithMe = (int) friendships.stream()
                .filter(f -> {
                    AccessLevel accessLevel;
                    if (f.getRequesterId().equals(userId)) {
                        accessLevel = f.getRequesterAccess();
                    } else {
                        accessLevel = f.getRecipientAccess();
                    }
                    return accessLevel != AccessLevel.NONE;
                })
                .count();

        int iSharedWith = (int) friendships.stream()
                .filter(f -> {
                    AccessLevel accessLevel;
                    if (f.getRequesterId().equals(userId)) {
                        accessLevel = f.getRecipientAccess();
                    } else {
                        accessLevel = f.getRequesterAccess();
                    }
                    return accessLevel != AccessLevel.NONE;
                })
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalFriends", totalFriends);
        summary.put("sharedWithMe", sharedWithMe);
        summary.put("iSharedWith", iSharedWith);
        summary.put("notSharedYet", totalFriends - iSharedWith);

        return summary;
    }

    @Override
    public Map<String, Object> quickShareExpenses(Integer currentUserId, Integer targetUserId, AccessLevel accessLevel)
            throws Exception {
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

        if (friendship.getRequesterId().equals(currentUserId)) {
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
    public List<Map<String, Object>> getSharedWithMe(Integer userId) throws Exception {
        List<Friendship> friendships = getUserFriendships(userId);
        return friendships.stream()
                .filter(f -> {
                    AccessLevel accessLevel;
                    if (f.getRequesterId().equals(userId)) {
                        accessLevel = f.getRequesterAccess();
                    } else {
                        accessLevel = f.getRecipientAccess();
                    }
                    return accessLevel != AccessLevel.NONE;
                })
                .map(f -> {
                    try {
                        Integer friendId = f.getRequesterId().equals(userId)
                                ? f.getRecipientId()
                                : f.getRequesterId();
                        UserDto friend = helper.validateUser(friendId);

                        AccessLevel accessLevel = getUserAccessLevel(friend.getId(), userId);

                        Map<String, Object> shareInfo = new HashMap<>();
                        shareInfo.put("userId", friend.getId());
                        shareInfo.put("name", friend.getFirstName() + " " + friend.getLastName());
                        shareInfo.put("username", friend.getUsername());
                        shareInfo.put("email", friend.getEmail());
                        shareInfo.put("image", friend.getImage());
                        shareInfo.put("profileImage",
                                friend.getProfileImage() != null ? friend.getProfileImage() : friend.getImage());
                        shareInfo.put("accessLevel", accessLevel);
                        shareInfo.put("canModify", accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL);

                        return shareInfo;
                    } catch (Exception e) {
                        throw new RuntimeException("Error processing shared user: " + e.getMessage());
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getISharedWith(Integer userId) throws Exception {
        List<Friendship> friendships = getUserFriendships(userId);
        return friendships.stream()
                .filter(f -> {
                    AccessLevel accessLevel;
                    if (f.getRequesterId().equals(userId)) {
                        accessLevel = f.getRecipientAccess();
                    } else {
                        accessLevel = f.getRequesterAccess();
                    }
                    return accessLevel != AccessLevel.NONE;
                })
                .map(f -> {
                    try {
                        Integer friendId = f.getRequesterId().equals(userId)
                                ? f.getRecipientId()
                                : f.getRequesterId();
                        UserDto friend = helper.validateUser(friendId);

                        AccessLevel accessLevel = getUserAccessLevel(userId, friend.getId());

                        Map<String, Object> shareInfo = new HashMap<>();
                        shareInfo.put("userId", friend.getId());
                        shareInfo.put("name", friend.getFirstName() + " " + friend.getLastName());
                        shareInfo.put("username", friend.getUsername());
                        shareInfo.put("email", friend.getEmail());
                        shareInfo.put("image", friend.getImage());
                        shareInfo.put("profileImage",
                                friend.getProfileImage() != null ? friend.getProfileImage() : friend.getImage());
                        shareInfo.put("accessLevel", accessLevel);
                        shareInfo.put("canModify", accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL);

                        return shareInfo;
                    } catch (Exception e) {
                        throw new RuntimeException("Error processing shared user: " + e.getMessage());
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getExpenseAccessInfo(Integer ownerId, Integer viewerId) throws Exception {
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
        if (!friendship.getRequesterId().equals(userId) &&
                !friendship.getRecipientId().equals(userId)) {
            // Not a participant, deny access
            throw new RuntimeException("Access denied: User is not part of this friendship");
        }
        return friendship;
    }

    // FriendshipServiceImpl.java
    @Override
    public List<Map<String, Object>> getDetailedFriends(Integer userId) throws Exception {
        List<Friendship> friendships = getUserFriendships(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Friendship f : friendships) {
            try {
                // Only include if requesterAccess is not NONE
                if (f.getRequesterId().equals(userId) && f.getRequesterAccess() == AccessLevel.NONE) {
                    continue;
                }
                if (f.getRecipientId().equals(userId) && f.getRecipientAccess() == AccessLevel.NONE) {
                    continue;
                }

                Integer friendId = f.getRequesterId().equals(userId) ? f.getRecipientId() : f.getRequesterId();
                UserDto friend = helper.validateUser(friendId);

                Map<String, Object> map = new HashMap<>();
                map.put("id", friend.getId());
                map.put("name", friend.getFirstName() + " " + friend.getLastName());
                map.put("email", friend.getEmail());
                map.put("status", f.getStatus().name());
                String color = "#00DAC6";
                if (f.getStatus() == FriendshipStatus.PENDING)
                    color = "#FFC107";
                else if (f.getStatus() == FriendshipStatus.REJECTED)
                    color = "#ff4d4f";
                else if (f.getStatus() == FriendshipStatus.ACCEPTED)
                    color = "#5b7fff";
                map.put("color", color);
                map.put("image", friend.getImage() != null ? friend.getImage() : "");
                map.put("profileImage", friend.getProfileImage() != null ? friend.getProfileImage()
                        : (friend.getImage() != null ? friend.getImage() : ""));
                AccessLevel accessLevel = f.getRequesterId().equals(userId) ? f.getRecipientAccess()
                        : f.getRequesterAccess();
                map.put("accessLevel", accessLevel.name());
                map.put("friendshipId", f.getId());
                map.put("requesterAccess", f.getRequesterAccess().name());
                map.put("recipientAccess", f.getRecipientAccess().name());
                map.put("requesterUserId", f.getRequesterId());
                map.put("recipientUserId", f.getRecipientId());
                result.add(map);
            } catch (Exception e) {
                throw new RuntimeException("Error processing friend details: " + e.getMessage());
            }
        }
        return result;
    }

    @Override
    public Map<String, Object> getFriendshipDetails(Integer userId1, Integer userId2) throws Exception {
        Friendship friendship = getFriendship(userId1, userId2);
        if (friendship == null) {
            return null;
        }

        UserDto requester = helper.validateUser(friendship.getRequesterId());
        UserDto recipient = helper.validateUser(friendship.getRecipientId());

        Map<String, Object> map = new HashMap<>();
        map.put("id", friendship.getId());
        map.put("status", friendship.getStatus().name());
        map.put("requesterAccess", friendship.getRequesterAccess().name());
        map.put("recipientAccess", friendship.getRecipientAccess().name());
        boolean isRequester = friendship.getRequesterId().equals(userId1);
        map.put("directionSwapped", !isRequester);

        Map<String, Object> requesterMap = new HashMap<>();
        requesterMap.put("id", requester.getId());
        requesterMap.put("username", requester.getUsername());
        requesterMap.put("email", requester.getEmail());
        requesterMap.put("firstName", requester.getFirstName());
        requesterMap.put("lastName", requester.getLastName());
        requesterMap.put("image", requester.getImage());
        requesterMap.put("profileImage",
                requester.getProfileImage() != null ? requester.getProfileImage() : requester.getImage());

        Map<String, Object> recipientMap = new HashMap<>();
        recipientMap.put("id", recipient.getId());
        recipientMap.put("username", recipient.getUsername());
        recipientMap.put("email", recipient.getEmail());
        recipientMap.put("firstName", recipient.getFirstName());
        recipientMap.put("lastName", recipient.getLastName());
        recipientMap.put("image", recipient.getImage());
        recipientMap.put("profileImage",
                recipient.getProfileImage() != null ? recipient.getProfileImage() : recipient.getImage());

        map.put("requester", requesterMap);
        map.put("recipient", recipientMap);

        return map;
    }

    @Override
    public List<UserDto> getFriendsOfUser(Integer userId) throws Exception {
        UserDto user = helper.validateUser(userId);
        List<Friendship> friendships = friendshipRepository.findByRequesterIdOrRecipientId(user.getId());
        List<UserDto> friends = new ArrayList<>();
        for (Friendship friendship : friendships) {
            if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
                Integer friendId = friendship.getRequesterId().equals(userId)
                        ? friendship.getRecipientId()
                        : friendship.getRequesterId();
                try {
                    UserDto friend = helper.validateUser(friendId);
                    friends.add(friend);
                } catch (Exception e) {
                    // Skip if user not found
                }
            }
        }
        return friends;
    }

    // Note: Old helper methods removed - now using UnifiedActivityService for all
    // events

    @Override
    public FriendshipReportDTO generateFriendshipReport(
            Integer userId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            FriendshipStatus status,
            AccessLevel accessLevel,
            String sortBy,
            String sortDirection,
            int page,
            int size) throws Exception {

        // Build sort
        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        // Get paginated friendships
        Page<Friendship> friendshipsPage = friendshipRepository.findFriendshipsForReport(
                userId, status, fromDate, toDate, pageable);

        // Get all friendships for stats (without pagination)
        List<Friendship> allFriendships = friendshipRepository.findByRequesterIdOrRecipientId(userId);

        // Calculate stats
        int totalFriends = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .count();
        int pendingRequests = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.PENDING && f.getRecipientId().equals(userId))
                .count();
        int blockedUsers = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.REJECTED)
                .count();

        // Debug: Log friendship details for troubleshooting
        System.out.println("=== Friendship Report Debug for userId: " + userId + " ===");
        allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .forEach(f -> {
                    boolean isRequester = f.getRequesterId().equals(userId);
                    AccessLevel iSharedAccess = isRequester ? f.getRecipientAccess() : f.getRequesterAccess();
                    AccessLevel sharedWithMeAccess = isRequester ? f.getRequesterAccess() : f.getRecipientAccess();
                    System.out.println("Friendship ID: " + f.getId() +
                            ", isRequester: " + isRequester +
                            ", requesterAccess: " + f.getRequesterAccess() +
                            ", recipientAccess: " + f.getRecipientAccess() +
                            ", iSharedAccess: " + iSharedAccess +
                            ", sharedWithMeAccess: " + sharedWithMeAccess);
                });

        // Calculate I shared with / shared with me counts
        // I Shared With: Friends who can see MY data (access I granted TO them)
        // - If I'm requester: I set recipientAccess for recipient to see my data
        // - If I'm recipient: I set requesterAccess for requester to see my data
        int iSharedWithCount = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .filter(f -> {
                    AccessLevel iSharedLevel;
                    if (f.getRequesterId().equals(userId)) {
                        // I'm requester, recipientAccess = what recipient can see of MY data
                        iSharedLevel = f.getRecipientAccess();
                    } else {
                        // I'm recipient, requesterAccess = what requester can see of MY data
                        iSharedLevel = f.getRequesterAccess();
                    }
                    return iSharedLevel != null && iSharedLevel != AccessLevel.NONE;
                })
                .count();

        // Shared With Me: Friends whose data I can see (access they granted TO me)
        // - If I'm requester: Recipient set requesterAccess for me to see their data
        // - If I'm recipient: Requester set recipientAccess for me to see their data
        int sharedWithMeCount = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .filter(f -> {
                    AccessLevel sharedWithMeLevel;
                    if (f.getRequesterId().equals(userId)) {
                        // I'm requester, requesterAccess = what I can see of recipient's data
                        sharedWithMeLevel = f.getRequesterAccess();
                    } else {
                        // I'm recipient, recipientAccess = what I can see of requester's data
                        sharedWithMeLevel = f.getRecipientAccess();
                    }
                    return sharedWithMeLevel != null && sharedWithMeLevel != AccessLevel.NONE;
                })
                .count();

        System.out.println("iSharedWithCount: " + iSharedWithCount + ", sharedWithMeCount: " + sharedWithMeCount);
        System.out.println("=== End Debug ===");

        // Calculate access level distribution
        Map<String, Integer> accessLevelDistribution = new HashMap<>();
        for (AccessLevel level : AccessLevel.values()) {
            accessLevelDistribution.put(level.name(), 0);
        }
        allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .forEach(f -> {
                    AccessLevel myAccess;
                    if (f.getRequesterId().equals(userId)) {
                        myAccess = f.getRequesterAccess() != null ? f.getRequesterAccess() : AccessLevel.NONE;
                    } else {
                        myAccess = f.getRecipientAccess() != null ? f.getRecipientAccess() : AccessLevel.NONE;
                    }
                    accessLevelDistribution.merge(myAccess.name(), 1, Integer::sum);
                });

        // Generate monthly activity data (last 6 months)
        List<FriendshipReportDTO.MonthlyActivityDTO> monthlyActivity = generateMonthlyActivity(userId);

        // Generate sharing status data
        List<FriendshipReportDTO.SharingStatusDTO> sharingStatus = Arrays.asList(
                FriendshipReportDTO.SharingStatusDTO.builder()
                        .name("I Shared With").count(iSharedWithCount).build(),
                FriendshipReportDTO.SharingStatusDTO.builder()
                        .name("Shared With Me").count(sharedWithMeCount).build(),
                FriendshipReportDTO.SharingStatusDTO.builder()
                        .name("Pending Requests").count(pendingRequests).build(),
                FriendshipReportDTO.SharingStatusDTO.builder()
                        .name("Total Friends").count(totalFriends).build());

        // Generate top friends
        List<FriendshipReportDTO.TopFriendDTO> topFriends = generateTopFriends(userId, allFriendships);

        // Convert friendships to detail DTOs
        List<FriendshipReportDTO.FriendshipDetailDTO> friendshipDetails = new ArrayList<>();
        for (Friendship f : friendshipsPage.getContent()) {
            try {
                Integer friendId = f.getRequesterId().equals(userId) ? f.getRecipientId() : f.getRequesterId();
                UserDto friend = helper.validateUser(friendId);

                AccessLevel myAccess = f.getRequesterId().equals(userId)
                        ? f.getRequesterAccess()
                        : f.getRecipientAccess();
                AccessLevel theirAccess = f.getRequesterId().equals(userId)
                        ? f.getRecipientAccess()
                        : f.getRequesterAccess();

                friendshipDetails.add(FriendshipReportDTO.FriendshipDetailDTO.builder()
                        .id(f.getId())
                        .friendId(friendId)
                        .friendName(friend.getFirstName() + " " + friend.getLastName())
                        .friendEmail(friend.getEmail())
                        .status(f.getStatus())
                        .myAccessLevel(myAccess != null ? myAccess : AccessLevel.NONE)
                        .theirAccessLevel(theirAccess != null ? theirAccess : AccessLevel.NONE)
                        .connectedSince(f.getCreatedAt())
                        .lastUpdated(f.getUpdatedAt())
                        .build());
            } catch (Exception e) {
                // Skip if user not found
            }
        }

        // Build filter info
        FriendshipReportDTO.FilterInfo filterInfo = FriendshipReportDTO.FilterInfo.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .status(status)
                .accessLevel(accessLevel)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        return FriendshipReportDTO.builder()
                .totalFriends(totalFriends)
                .pendingRequests(pendingRequests)
                .blockedUsers(blockedUsers)
                .iSharedWithCount(iSharedWithCount)
                .sharedWithMeCount(sharedWithMeCount)
                .accessLevelDistribution(accessLevelDistribution)
                .monthlyActivity(monthlyActivity)
                .sharingStatus(sharingStatus)
                .topFriends(topFriends)
                .friendships(friendshipDetails)
                .appliedFilters(filterInfo)
                .totalElements((int) friendshipsPage.getTotalElements())
                .totalPages(friendshipsPage.getTotalPages())
                .currentPage(page)
                .pageSize(size)
                .build();
    }

    private List<FriendshipReportDTO.MonthlyActivityDTO> generateMonthlyActivity(Integer userId) {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<FriendshipReportDTO.MonthlyActivityDTO> activity = new ArrayList<>();

        // Get data from repository
        List<Object[]> newFriendsData = friendshipRepository.countNewFriendsByMonth(userId, sixMonthsAgo);
        List<Object[]> requestsSentData = friendshipRepository.countRequestsSentByMonth(userId, sixMonthsAgo);
        List<Object[]> requestsReceivedData = friendshipRepository.countRequestsReceivedByMonth(userId, sixMonthsAgo);

        // Convert to maps for easy lookup
        Map<Integer, Long> newFriendsMap = new HashMap<>();
        Map<Integer, Long> requestsSentMap = new HashMap<>();
        Map<Integer, Long> requestsReceivedMap = new HashMap<>();

        for (Object[] row : newFriendsData) {
            newFriendsMap.put((Integer) row[0], (Long) row[1]);
        }
        for (Object[] row : requestsSentData) {
            requestsSentMap.put((Integer) row[0], (Long) row[1]);
        }
        for (Object[] row : requestsReceivedData) {
            requestsReceivedMap.put((Integer) row[0], (Long) row[1]);
        }

        // Generate last 6 months data
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = now.minusMonths(i);
            int monthValue = month.getMonthValue();
            String monthName = Month.of(monthValue).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            activity.add(FriendshipReportDTO.MonthlyActivityDTO.builder()
                    .month(monthName)
                    .newFriends(newFriendsMap.getOrDefault(monthValue, 0L).intValue())
                    .requestsSent(requestsSentMap.getOrDefault(monthValue, 0L).intValue())
                    .requestsReceived(requestsReceivedMap.getOrDefault(monthValue, 0L).intValue())
                    .build());
        }

        return activity;
    }

    private List<FriendshipReportDTO.TopFriendDTO> generateTopFriends(Integer userId, List<Friendship> allFriendships) {
        String[] colors = { "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#3b82f6" };
        List<FriendshipReportDTO.TopFriendDTO> topFriends = new ArrayList<>();

        List<Friendship> acceptedFriends = allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .limit(5)
                .collect(Collectors.toList());

        int colorIndex = 0;
        for (Friendship f : acceptedFriends) {
            try {
                Integer friendId = f.getRequesterId().equals(userId) ? f.getRecipientId() : f.getRequesterId();
                UserDto friend = helper.validateUser(friendId);

                // Calculate interaction score based on access levels
                int score = calculateInteractionScore(f, userId);

                topFriends.add(FriendshipReportDTO.TopFriendDTO.builder()
                        .userId(friendId)
                        .name(friend.getFirstName() + " " + friend.getLastName())
                        .email(friend.getEmail())
                        .interactionScore(score)
                        .fill(colors[colorIndex % colors.length])
                        .build());
                colorIndex++;
            } catch (Exception e) {
                // Skip if user not found
            }
        }

        return topFriends;
    }

    private int calculateInteractionScore(Friendship f, Integer userId) {
        int score = 10; // Base score for being friends

        AccessLevel myAccess = f.getRequesterId().equals(userId)
                ? f.getRequesterAccess()
                : f.getRecipientAccess();
        AccessLevel theirAccess = f.getRequesterId().equals(userId)
                ? f.getRecipientAccess()
                : f.getRequesterAccess();

        // Add score based on access levels
        if (myAccess != null) {
            switch (myAccess) {
                case FULL:
                    score += 30;
                    break;
                case WRITE:
                    score += 20;
                    break;
                case READ:
                    score += 10;
                    break;
                default:
                    break;
            }
        }
        if (theirAccess != null) {
            switch (theirAccess) {
                case FULL:
                    score += 30;
                    break;
                case WRITE:
                    score += 20;
                    break;
                case READ:
                    score += 10;
                    break;
                default:
                    break;
            }
        }

        return score;
    }
}