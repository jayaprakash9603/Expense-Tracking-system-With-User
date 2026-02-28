package com.jaya.common.service.client.local;

import com.jaya.common.service.client.IFriendshipServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Local implementation for Friendship Service client in monolithic mode.
 * Calls the local FriendshipService bean directly instead of making HTTP calls.
 */
@Component
@Profile("monolithic")
@Slf4j
public class LocalFriendshipServiceClient implements IFriendshipServiceClient {

    private final ApplicationContext applicationContext;
    private Object friendshipService;

    @Autowired
    public LocalFriendshipServiceClient(@Lazy ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    private Object getFriendshipService() {
        if (friendshipService == null) {
            try {
                friendshipService = applicationContext.getBean("friendshipServiceImpl");
            } catch (Exception e) {
                log.warn("Could not find friendshipServiceImpl, trying FriendshipServiceImpl class", e);
                try {
                    friendshipService = applicationContext.getBean(
                        Class.forName("com.jaya.service.FriendshipServiceImpl"));
                } catch (ClassNotFoundException ex) {
                    log.error("FriendshipServiceImpl class not found", ex);
                    throw new RuntimeException("FriendshipService not available in monolithic mode", ex);
                }
            }
        }
        return friendshipService;
    }

    @Override
    public boolean canUserAccessExpenses(Integer targetUserId, Integer requesterId) {
        log.debug("LocalFriendshipServiceClient: Checking access for target: {}, requester: {}", 
                  targetUserId, requesterId);
        try {
            Object service = getFriendshipService();
            var method = service.getClass().getMethod(
                "canUserAccessExpenses", Integer.class, Integer.class);
            return (Boolean) method.invoke(service, targetUserId, requesterId);
        } catch (Exception e) {
            log.error("Error calling local FriendshipService.canUserAccessExpenses", e);
            throw new RuntimeException("Failed to check expense access locally", e);
        }
    }

    @Override
    public boolean canUserModifyExpenses(Integer targetUserId, Integer requesterId) {
        log.debug("LocalFriendshipServiceClient: Checking modify permission for target: {}, requester: {}", 
                  targetUserId, requesterId);
        try {
            Object service = getFriendshipService();
            var method = service.getClass().getMethod(
                "canUserModifyExpenses", Integer.class, Integer.class);
            return (Boolean) method.invoke(service, targetUserId, requesterId);
        } catch (Exception e) {
            log.error("Error calling local FriendshipService.canUserModifyExpenses", e);
            throw new RuntimeException("Failed to check expense modify permission locally", e);
        }
    }

    @Override
    public boolean areFriends(Integer userId1, Integer userId2) {
        log.debug("LocalFriendshipServiceClient: Checking friendship between {} and {}", userId1, userId2);
        try {
            Object service = getFriendshipService();
            var method = service.getClass().getMethod("areFriends", Integer.class, Integer.class);
            return (Boolean) method.invoke(service, userId1, userId2);
        } catch (Exception e) {
            log.error("Error calling local FriendshipService.areFriends", e);
            throw new RuntimeException("Failed to check friendship locally", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Integer> getFriendIds(Integer userId) {
        log.debug("LocalFriendshipServiceClient: Getting friend IDs for user: {}", userId);
        try {
            Object service = getFriendshipService();
            var method = service.getClass().getMethod("getFriendIds", Integer.class);
            return (List<Integer>) method.invoke(service, userId);
        } catch (Exception e) {
            log.error("Error calling local FriendshipService.getFriendIds", e);
            throw new RuntimeException("Failed to get friend IDs locally", e);
        }
    }

    @Override
    public String getUserAccessLevel(Integer userId, Integer viewerId) {
        log.debug("LocalFriendshipServiceClient: Getting access level for user: {} viewed by: {}", 
                  userId, viewerId);
        try {
            Object service = getFriendshipService();
            var method = service.getClass().getMethod("getUserAccessLevel", Integer.class, Integer.class);
            Object result = method.invoke(service, userId, viewerId);
            return result != null ? result.toString() : null;
        } catch (Exception e) {
            log.error("Error calling local FriendshipService.getUserAccessLevel", e);
            throw new RuntimeException("Failed to get access level locally", e);
        }
    }
}
