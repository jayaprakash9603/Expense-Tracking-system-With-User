package com.jaya.task.user.service.cache;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.service.UserProfileCacheService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

/**
 * L2 Caffeine store for {@link User} entities. Synchronized load per key avoids
 * thundering herd; null results are not cached.
 */
@Component
public class UserProfileCacheStore {

    private final Cache<Integer, User> byId;
    private final Cache<String, User> byEmail;
    private final ConcurrentHashMap<Integer, Object> idLocks = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Object> emailLocks = new ConcurrentHashMap<>();

    public UserProfileCacheStore(
            @Value("${app.cache.user-profile.ttl-minutes:10}") long ttlMinutes,
            @Value("${app.cache.user-profile.max-size:10000}") long maxSize) {

        Caffeine<Object, Object> builder = Caffeine.newBuilder()
                .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
                .maximumSize(maxSize)
                .recordStats();

        this.byId = builder.build();
        this.byEmail = builder.build();
    }

    public User getById(Integer userId, Function<Integer, User> loader) {
        if (userId == null) {
            return null;
        }
        User cached = byId.getIfPresent(userId);
        if (cached != null) {
            return cached;
        }
        Object lock = idLocks.computeIfAbsent(userId, ignored -> new Object());
        synchronized (lock) {
            try {
                cached = byId.getIfPresent(userId);
                if (cached != null) {
                    return cached;
                }
                User loaded = loader.apply(userId);
                if (loaded != null) {
                    storeUser(loaded);
                }
                return loaded;
            } finally {
                idLocks.remove(userId, lock);
            }
        }
    }

    public User getByEmail(String email, Function<String, User> loader) {
        String normalized = UserProfileCacheService.normalizeEmail(email);
        if (normalized == null) {
            return null;
        }
        User cached = byEmail.getIfPresent(normalized);
        if (cached != null) {
            return cached;
        }
        Object lock = emailLocks.computeIfAbsent(normalized, ignored -> new Object());
        synchronized (lock) {
            try {
                cached = byEmail.getIfPresent(normalized);
                if (cached != null) {
                    return cached;
                }
                User loaded = loader.apply(normalized);
                if (loaded != null) {
                    storeUser(loaded);
                }
                return loaded;
            } finally {
                emailLocks.remove(normalized, lock);
            }
        }
    }

    public void evict(Integer userId, String email) {
        if (userId != null) {
            byId.invalidate(userId);
        }
        String normalized = UserProfileCacheService.normalizeEmail(email);
        if (normalized != null) {
            byEmail.invalidate(normalized);
        }
    }

    private void storeUser(User user) {
        if (user.getId() != null) {
            byId.put(user.getId(), user);
        }
        String normalized = UserProfileCacheService.normalizeEmail(user.getEmail());
        if (normalized != null) {
            byEmail.put(normalized, user);
        }
    }
}
