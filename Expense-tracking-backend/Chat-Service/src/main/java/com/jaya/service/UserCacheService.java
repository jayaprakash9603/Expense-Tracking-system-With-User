package com.jaya.service;

import com.jaya.common.dto.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Service for caching user information to avoid N+1 query issues.
 * Uses Redis for persistent caching and local request-scope cache for batch operations.
 */
@Service
public class UserCacheService {

    private static final Logger logger = LoggerFactory.getLogger(UserCacheService.class);
    private static final String USER_CACHE_PREFIX = "user:cache:";
    private static final int USER_CACHE_TTL_MINUTES = 5;

    @Autowired
    private IUserServiceClient userClient;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // Thread-local cache for batch operations within a single request
    private final ThreadLocal<Map<Integer, UserDTO>> requestScopeCache = ThreadLocal.withInitial(ConcurrentHashMap::new);

    /**
     * Get a user by ID, using cache first.
     * 
     * @param userId The user ID to fetch
     * @return The UserDTO or null if not found
     */
    public UserDTO getUser(Integer userId) {
        if (userId == null) {
            return null;
        }

        // Check request-scope cache first
        Map<Integer, UserDTO> localCache = requestScopeCache.get();
        if (localCache.containsKey(userId)) {
            return localCache.get(userId);
        }

        // Check Redis cache
        String cacheKey = USER_CACHE_PREFIX + userId;
        try {
            Object cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached instanceof UserDTO) {
                UserDTO UserDTO = (UserDTO) cached;
                localCache.put(userId, UserDTO);
                return UserDTO;
            }
        } catch (Exception e) {
            logger.debug("Redis cache miss for user {}: {}", userId, e.getMessage());
        }

        // Fetch from service
        try {
            UserDTO user = userClient.getUserProfileById(userId);
            if (user != null) {
                cacheUser(userId, user);
                localCache.put(userId, user);
                return user;
            }
        } catch (Exception e) {
            logger.debug("Failed to fetch user {}: {}", userId, e.getMessage());
        }

        return null;
    }

    /**
     * Preload multiple users into cache.
     * This is the key method to avoid N+1 issues - call this before processing a list of chats.
     * 
     * @param userIds The set of user IDs to preload
     */
    public void preloadUsers(Set<Integer> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }

        Map<Integer, UserDTO> localCache = requestScopeCache.get();
        Set<Integer> toFetch = new HashSet<>();

        // Find which users we need to fetch
        for (Integer userId : userIds) {
            if (userId != null && !localCache.containsKey(userId)) {
                // Check Redis cache
                String cacheKey = USER_CACHE_PREFIX + userId;
                try {
                    Object cached = redisTemplate.opsForValue().get(cacheKey);
                    if (cached instanceof UserDTO) {
                        localCache.put(userId, (UserDTO) cached);
                        continue;
                    }
                } catch (Exception e) {
                    // Redis miss, need to fetch
                }
                toFetch.add(userId);
            }
        }

        if (toFetch.isEmpty()) {
            return;
        }

        // Fetch users in parallel using CompletableFuture
        logger.debug("Preloading {} users: {}", toFetch.size(), toFetch);
        List<CompletableFuture<Void>> futures = toFetch.stream()
                .map(userId -> CompletableFuture.runAsync(() -> {
                    try {
                        UserDTO user = userClient.getUserProfileById(userId);
                        if (user != null) {
                            cacheUser(userId, user);
                            localCache.put(userId, user);
                        }
                    } catch (Exception e) {
                        logger.debug("Failed to preload user {}: {}", userId, e.getMessage());
                    }
                }))
                .collect(Collectors.toList());

        // Wait for all fetches to complete
        try {
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .get(10, TimeUnit.SECONDS);
        } catch (Exception e) {
            logger.warn("Timeout or error during user preload: {}", e.getMessage());
        }
    }

    /**
     * Extract all sender IDs from a list of chats for preloading.
     * 
     * @param chats List of chats
     * @return Set of unique sender IDs
     */
    public Set<Integer> extractSenderIds(List<?> chats) {
        if (chats == null || chats.isEmpty()) {
            return Collections.emptySet();
        }

        Set<Integer> senderIds = new HashSet<>();
        for (Object chat : chats) {
            if (chat instanceof com.jaya.models.Chat) {
                Integer senderId = ((com.jaya.models.Chat) chat).getSenderId();
                if (senderId != null) {
                    senderIds.add(senderId);
                }
            }
        }
        return senderIds;
    }

    /**
     * Clear the request-scope cache.
     * Call this at the end of a request if needed.
     */
    public void clearRequestCache() {
        requestScopeCache.remove();
    }

    /**
     * Cache a user in Redis.
     */
    private void cacheUser(Integer userId, UserDTO user) {
        String cacheKey = USER_CACHE_PREFIX + userId;
        try {
            redisTemplate.opsForValue().set(cacheKey, user, USER_CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        } catch (Exception e) {
            logger.debug("Failed to cache user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Invalidate cache for a specific user.
     * Call this when a user's profile is updated.
     */
    public void invalidateUser(Integer userId) {
        if (userId == null) {
            return;
        }
        String cacheKey = USER_CACHE_PREFIX + userId;
        try {
            redisTemplate.delete(cacheKey);
            requestScopeCache.get().remove(userId);
        } catch (Exception e) {
            logger.debug("Failed to invalidate user cache {}: {}", userId, e.getMessage());
        }
    }
}
