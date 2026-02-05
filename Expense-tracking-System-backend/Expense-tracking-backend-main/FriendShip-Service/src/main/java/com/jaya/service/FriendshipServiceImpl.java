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

    @Override
    public Friendship sendFriendRequest(Integer requesterId, Integer recipientId) throws Exception {
        if (requesterId.equals(recipientId)) {
            throw new RuntimeException("Cannot send friend request to yourself");
        }

        UserDto requester = helper.validateUser(requesterId);
        UserDto recipient = helper.validateUser(recipientId);

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

        unifiedActivityService.sendFriendRequestSentEvent(friendship, requester, recipient);

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

        if (!friendship.getRecipientId().equals(responderId)) {
            throw new RuntimeException("Only the recipient of a friend request can respond to it");
        }

        friendship.setStatus(accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.REJECTED);

        if (accept) {
            friendship.setRequesterAccess(AccessLevel.NONE);
            friendship.setRecipientAccess(AccessLevel.NONE);
        }

        friendship = friendshipRepository.save(friendship);

        try {
            UserDto requester = helper.validateUser(friendship.getRequesterId());
            UserDto recipient = helper.validateUser(friendship.getRecipientId());

            if (accept) {
                unifiedActivityService.sendFriendRequestAcceptedEvent(friendship, requester, recipient);
            } else {
                unifiedActivityService.sendFriendRequestRejectedEvent(friendship, requester, recipient);
            }
        } catch (Exception e) {
            System.err.println("Failed to send friend request response event: " + e.getMessage());
        }

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

        AccessLevel oldAccess = null;
        Integer otherUserId = null;

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

        if (!friendship.getRequesterId().equals(userId)) {
            throw new RuntimeException("Only the requester can cancel a friend request");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be cancelled");
        }

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

        if (!friendship.getRequesterId().equals(userId) && !friendship.getRecipientId().equals(userId)) {
            throw new RuntimeException("User is not part of this friendship");
        }

        if (friendship.getStatus() != FriendshipStatus.ACCEPTED) {
            throw new RuntimeException("Only accepted friendships can be removed");
        }

        Integer otherUserId = friendship.getRequesterId().equals(userId)
                ? friendship.getRecipientId()
                : friendship.getRequesterId();

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
        if (blockerId.equals(blockedId)) {
            throw new RuntimeException("Cannot block yourself");
        }

        UserDto blocker = helper.validateUser(blockerId);
        UserDto blocked = helper.validateUser(blockedId);

        Optional<Friendship> existingFriendship = friendshipRepository.findByRequesterIdAndRecipientId(blocker.getId(),
                blocked.getId());
        if (existingFriendship.isEmpty()) {
            existingFriendship = friendshipRepository.findByRequesterIdAndRecipientId(blocked.getId(), blocker.getId());
        }

        Friendship friendship;
        if (existingFriendship.isPresent()) {
            friendship = existingFriendship.get();
            friendship.setStatus(FriendshipStatus.BLOCKED);

            if (!friendship.getRequesterId().equals(blockerId)) {
                Integer tempRequester = friendship.getRequesterId();
                friendship.setRequesterId(friendship.getRecipientId());
                friendship.setRecipientId(tempRequester);

                friendship.setRequesterAccess(AccessLevel.NONE);
                friendship.setRecipientAccess(AccessLevel.NONE);
            }
        } else {
            friendship = Friendship.builder()
                    .requesterId(blocker.getId())
                    .recipientId(blocked.getId())
                    .status(FriendshipStatus.BLOCKED)
                    .requesterAccess(AccessLevel.NONE)
                    .recipientAccess(AccessLevel.NONE)
                    .build();
        }

        friendshipRepository.save(friendship);
    }

    @Override
    @Transactional
    public void unblockUser(Integer unblockerId, Integer unblockedId) throws Exception {
        if (unblockerId.equals(unblockedId)) {
            throw new RuntimeException("Cannot unblock yourself");
        }

        UserDto unblocker = helper.validateUser(unblockerId);
        UserDto unblocked = helper.validateUser(unblockedId);

        Optional<Friendship> blockedFriendship = friendshipRepository.findByRequesterIdAndRecipientIdAndStatus(
                unblocker.getId(), unblocked.getId(), FriendshipStatus.BLOCKED);

        if (blockedFriendship.isEmpty()) {
            throw new RuntimeException("No blocking relationship found between these users");
        }

        Friendship friendship = blockedFriendship.get();

        unifiedActivityService.sendUserUnblockedEvent(unblocker, unblocked);

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
        if (userId1.equals(userId2)) {
            return FriendshipStatus.NONE;
        }

        UserDto user1 = helper.validateUser(userId1);
        UserDto user2 = helper.validateUser(userId2);

        Optional<Friendship> friendship = friendshipRepository.findBidirectional(user1.getId(), user2.getId());
        return friendship.map(Friendship::getStatus).orElse(FriendshipStatus.NONE);
    }

    @Override
    public boolean isRequestSentByUser(Integer userId, Integer otherUserId) throws Exception {
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
        if (userId1.equals(userId2)) {
            return null;
        }

        UserDto user1 = helper.validateUser(userId1);
        UserDto user2 = helper.validateUser(userId2);

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

        List<Friendship> allRelationships = friendshipRepository.findByRequesterIdOrRecipientId(userId);

        Set<Integer> excludedUserIds = new HashSet<>();
        excludedUserIds.add(userId);

        for (Friendship friendship : allRelationships) {
            if (friendship.getRequesterId().equals(userId)) {
                excludedUserIds.add(friendship.getRecipientId());
            } else {
                excludedUserIds.add(friendship.getRequesterId());
            }
        }

        List<UserDto> friendsOfFriends = new ArrayList<>();
        List<Friendship> userFriendships = getUserFriendships(userId);

        for (Friendship friendship : userFriendships) {
            try {
                Integer friendId = friendship.getRequesterId().equals(userId) ? friendship.getRecipientId()
                        : friendship.getRequesterId();

                UserDto friend = helper.validateUser(friendId);

                List<Friendship> friendFriendships = getUserFriendships(friend.getId());

                for (Friendship friendFriendship : friendFriendships) {
                    try {
                        Integer friendFriendId = friendFriendship.getRequesterId().equals(friend.getId())
                                ? friendFriendship.getRecipientId()
                                : friendFriendship.getRequesterId();

                        if (!excludedUserIds.contains(friendFriendId)) {
                            UserDto friendOfFriend = helper.validateUser(friendFriendId);
                            friendsOfFriends.add(friendOfFriend);
                            excludedUserIds.add(friendFriendId);
                        }
                    } catch (Exception e) {
                        System.err.println("Error retrieving friend's friend: " + e.getMessage());
                    }
                }
            } catch (Exception e) {
                System.err.println("Error retrieving friend: " + e.getMessage());
            }
        }

        if (friendsOfFriends.size() < limit) {
            int remainingCount = limit - friendsOfFriends.size();
            List<UserDto> randomUsers = getRandomUsersExcluding(excludedUserIds, remainingCount);
            friendsOfFriends.addAll(randomUsers);
        }

        if (friendsOfFriends.size() > limit) {
            return friendsOfFriends.subList(0, limit);
        }

        return friendsOfFriends;
    }

    private List<UserDto> getRandomUsersExcluding(Set<Integer> excludedUserIds, int count) {
        List<UserDto> randomUsers = new ArrayList<>();

        try {
            List<UserDto> allUsers = userService.getAllUsers();

            List<UserDto> availableUsers = allUsers.stream()
                    .filter(user -> !excludedUserIds.contains(user.getId()))
                    .collect(Collectors.toList());

            Collections.shuffle(availableUsers);

            int usersToGet = Math.min(count, availableUsers.size());

            for (int i = 0; i < usersToGet; i++) {
                randomUsers.add(availableUsers.get(i));
            }

        } catch (Exception e) {
            System.err.println("Error getting random users: " + e.getMessage());

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
        if (userId1.equals(userId2)) {
            return Collections.emptyList();
        }

        List<Integer> friendsOfUser1 = getUserFriendships(userId1).stream()
                .map(f -> f.getRequesterId().equals(userId1) ? f.getRecipientId() : f.getRequesterId())
                .collect(Collectors.toList());

        List<Integer> friendsOfUser2 = getUserFriendships(userId2).stream()
                .map(f -> f.getRequesterId().equals(userId2) ? f.getRecipientId() : f.getRequesterId())
                .collect(Collectors.toList());

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

        return friendIds2.stream()
                .filter(user -> friendIds1.contains(user))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> searchFriends(Integer userId, String query) throws Exception {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

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
        if (ownerId.equals(viewerId)) {
            return true;
        }

        Optional<Friendship> friendshipOpt = friendshipRepository.findBidirectionalByStatus(
                ownerId, viewerId, FriendshipStatus.ACCEPTED);

        if (friendshipOpt.isEmpty()) {
            return false;
        }

        Friendship friendship = friendshipOpt.get();

        AccessLevel accessLevel;
        if (friendship.getRequesterId().equals(ownerId)) {
            accessLevel = friendship.getRecipientAccess();
        } else {
            accessLevel = friendship.getRequesterAccess();
        }

        return accessLevel == AccessLevel.READ ||
                accessLevel == AccessLevel.WRITE ||
                accessLevel == AccessLevel.FULL ||
                accessLevel == AccessLevel.LIMITED ||
                accessLevel == AccessLevel.SUMMARY;
    }

    @Override
    public boolean canUserModifyExpenses(Integer ownerId, Integer viewerId) throws Exception {
        if (ownerId.equals(viewerId)) {
            return true;
        }

        Optional<Friendship> friendshipOpt = friendshipRepository.findBidirectionalByStatus(
                ownerId, viewerId, FriendshipStatus.ACCEPTED);

        if (friendshipOpt.isEmpty()) {
            return false;
        }

        Friendship friendship = friendshipOpt.get();

        AccessLevel accessLevel;
        if (friendship.getRequesterId().equals(ownerId)) {
            accessLevel = friendship.getRecipientAccess();
        } else {
            accessLevel = friendship.getRequesterAccess();
        }

        return accessLevel == AccessLevel.WRITE || accessLevel == AccessLevel.FULL;
    }

    @Override
    public AccessLevel getUserAccessLevel(Integer ownerId, Integer viewerId) throws Exception {
        if (ownerId.equals(viewerId)) {
            return AccessLevel.FULL;
        }

        Optional<Friendship> friendshipOpt = friendshipRepository.findBidirectionalByStatus(
                ownerId, viewerId, FriendshipStatus.ACCEPTED);

        if (friendshipOpt.isEmpty()) {
            return AccessLevel.NONE;
        }

        Friendship friendship = friendshipOpt.get();

        if (friendship.getRequesterId().equals(ownerId)) {
            return friendship.getRecipientAccess();
        } else {
            return friendship.getRequesterAccess();
        }
    }

    @Override
    public void updateFriendship(Friendship friendship) {
        if (friendship == null) {
            throw new RuntimeException("Friendship cannot be null");
        }

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
            throw new RuntimeException("Access denied: User is not part of this friendship");
        }
        return friendship;
    }

    @Override
    public List<Map<String, Object>> getDetailedFriends(Integer userId) throws Exception {
        List<Friendship> friendships = getUserFriendships(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Friendship f : friendships) {
            try {
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
                }
            }
        }
        return friends;
    }

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
        Sort sort = Sort.by(
                "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Friendship> friendshipsPage = friendshipRepository.findFriendshipsForReport(
                userId, status, fromDate, toDate, pageable);
        List<Friendship> allFriendships = friendshipRepository.findByRequesterIdOrRecipientId(userId);
        int totalFriends = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .count();
        int pendingRequests = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.PENDING && f.getRecipientId().equals(userId))
                .count();
        int blockedUsers = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.REJECTED)
                .count();
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
        int iSharedWithCount = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .filter(f -> {
                    AccessLevel iSharedLevel;
                    if (f.getRequesterId().equals(userId)) {
                        iSharedLevel = f.getRecipientAccess();
                    } else {
                        iSharedLevel = f.getRequesterAccess();
                    }
                    return iSharedLevel != null && iSharedLevel != AccessLevel.NONE;
                })
                .count();
        int sharedWithMeCount = (int) allFriendships.stream()
                .filter(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .filter(f -> {
                    AccessLevel sharedWithMeLevel;
                    if (f.getRequesterId().equals(userId)) {
                        sharedWithMeLevel = f.getRequesterAccess();
                    } else {
                        sharedWithMeLevel = f.getRecipientAccess();
                    }
                    return sharedWithMeLevel != null && sharedWithMeLevel != AccessLevel.NONE;
                })
                .count();

        System.out.println("iSharedWithCount: " + iSharedWithCount + ", sharedWithMeCount: " + sharedWithMeCount);
        System.out.println("=== End Debug ===");
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
        List<FriendshipReportDTO.MonthlyActivityDTO> monthlyActivity = generateMonthlyActivity(userId);
        List<FriendshipReportDTO.SharingStatusDTO> sharingStatus = Arrays.asList(
                FriendshipReportDTO.SharingStatusDTO.builder()
                        .name("I Shared With").count(iSharedWithCount).build(),
                FriendshipReportDTO.SharingStatusDTO.builder()
                        .name("Shared With Me").count(sharedWithMeCount).build(),
                FriendshipReportDTO.SharingStatusDTO.builder()
                        .name("Pending Requests").count(pendingRequests).build(),
                FriendshipReportDTO.SharingStatusDTO.builder()
                        .name("Total Friends").count(totalFriends).build());
        List<FriendshipReportDTO.TopFriendDTO> topFriends = generateTopFriends(userId, allFriendships);
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
            }
        }
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
        List<Object[]> newFriendsData = friendshipRepository.countNewFriendsByMonth(userId, sixMonthsAgo);
        List<Object[]> requestsSentData = friendshipRepository.countRequestsSentByMonth(userId, sixMonthsAgo);
        List<Object[]> requestsReceivedData = friendshipRepository.countRequestsReceivedByMonth(userId, sixMonthsAgo);
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
            }
        }

        return topFriends;
    }

    private int calculateInteractionScore(Friendship f, Integer userId) {
        int score = 10;

        AccessLevel myAccess = f.getRequesterId().equals(userId)
                ? f.getRequesterAccess()
                : f.getRecipientAccess();
        AccessLevel theirAccess = f.getRequesterId().equals(userId)
                ? f.getRecipientAccess()
                : f.getRequesterAccess();
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