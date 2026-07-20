package com.jaya.common.cache.user;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.jaya.common.dto.UserDTO;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * L2 Caffeine cache for {@link UserDTO} in consuming microservices.
 * Eviction: TTL + max-size. Null results are not cached.
 */
@Component
public class UserProfileClientCacheStore {

    private final Cache<Integer, UserDTO> byId;
    private final Cache<String, UserDTO> byEmail;
    private final ConcurrentHashMap<Integer, Object> idLocks = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Object> emailLocks = new ConcurrentHashMap<>();

    public UserProfileClientCacheStore(UserProfileCacheProperties properties) {
        Caffeine<Object, Object> builder = Caffeine.newBuilder()
                .expireAfterWrite(properties.getTtlMinutes(), TimeUnit.MINUTES)
                .maximumSize(properties.getMaxSize())
                .recordStats();

        this.byId = builder.build();
        this.byEmail = builder.build();
    }

    public UserDTO getById(Integer userId, Supplier<UserDTO> loader) {
        if (userId == null) {
            return null;
        }
        UserDTO cached = byId.getIfPresent(userId);
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
                UserDTO loaded = loader.get();
                if (loaded != null) {
                    storeUser(loaded);
                }
                return loaded;
            } finally {
                idLocks.remove(userId, lock);
            }
        }
    }

    public UserDTO getByEmail(String email, Supplier<UserDTO> loader) {
        String normalized = normalizeEmail(email);
        if (normalized == null) {
            return null;
        }
        UserDTO cached = byEmail.getIfPresent(normalized);
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
                UserDTO loaded = loader.get();
                if (loaded != null) {
                    storeUser(loaded);
                }
                return loaded;
            } finally {
                emailLocks.remove(normalized, lock);
            }
        }
    }

    public void remember(UserDTO user) {
        storeUser(user);
    }

    public void evict(Integer userId, String email) {
        if (userId != null) {
            byId.invalidate(userId);
        }
        String normalized = normalizeEmail(email);
        if (normalized != null) {
            byEmail.invalidate(normalized);
        }
    }

    private void storeUser(UserDTO user) {
        if (user == null) {
            return;
        }
        if (user.getId() != null) {
            byId.put(user.getId(), user);
        }
        String email = normalizeEmail(user.getEmail());
        if (email != null) {
            byEmail.put(email, user);
        }
    }

    public static String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String trimmed = email.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase();
    }
}
