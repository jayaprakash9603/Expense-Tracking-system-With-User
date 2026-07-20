package com.jaya.task.user.service.service;

import com.jaya.common.dto.UserDTO;
import com.jaya.task.user.service.cache.RequestUserCache;
import com.jaya.task.user.service.cache.UserProfileCacheStore;
import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.mapper.UserMapper;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Read-through user profile cache: L1 per-request + L2 Caffeine + DB.
 * Safe to inject from the security filter chain (no security-bean dependencies).
 */
@Service
public class UserProfileCacheService {

    private final UserRepository userRepository;
    private final UserMapper mapper;
    private final UserProfileCacheStore cacheStore;

    public UserProfileCacheService(
            UserRepository userRepository,
            UserMapper mapper,
            UserProfileCacheStore cacheStore) {
        this.userRepository = userRepository;
        this.mapper = mapper;
        this.cacheStore = cacheStore;
    }

    public User getUserByEmail(String email) {
        String normalized = normalizeEmail(email);
        if (normalized == null) {
            return null;
        }

        User requestHit = RequestUserCache.getByEmail(normalized);
        if (requestHit != null) {
            return requestHit;
        }

        User user = cacheStore.getByEmail(normalized, this::loadUserByEmailFromDb);
        remember(user);
        return user;
    }

    public User getUserEntityById(Integer userId) {
        if (userId == null) {
            return null;
        }

        User requestHit = RequestUserCache.getById(userId);
        if (requestHit != null) {
            return requestHit;
        }

        User user = cacheStore.getById(userId, this::loadUserByIdFromDb);
        remember(user);
        return user;
    }

    public UserDTO getUserById(Integer userId) {
        User user = getUserEntityById(userId);
        return user == null ? null : mapper.toDTO(user);
    }

    public Integer resolveUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String email = JwtProvider.getEmailFromJwt(authHeader);
            User user = getUserByEmail(email);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            return null;
        }
    }

    private User loadUserByEmailFromDb(String email) {
        User user = userRepository.findByEmail(email);
        if (user != null && isBlank(user.getCurrentMode())) {
            user.setCurrentMode("USER");
            user.setUpdatedAt(LocalDateTime.now());
            user = userRepository.save(user);
        }
        return user;
    }

    private User loadUserByIdFromDb(Integer userId) {
        return userRepository.findById(userId).orElse(null);
    }

    private static void remember(User user) {
        if (user == null) {
            return;
        }
        String email = normalizeEmail(user.getEmail());
        if (email != null) {
            RequestUserCache.putByEmail(email, user);
        }
        if (user.getId() != null) {
            RequestUserCache.putById(user.getId(), user);
        }
    }

    public static String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String trimmed = email.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase();
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
