package com.jaya.common.service.client;

import com.jaya.common.cache.user.ClientRequestUserCache;
import com.jaya.common.cache.user.UserProfileClientCacheStore;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.security.JwtUtil;
import com.jaya.common.service.client.feign.FeignUserServiceClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Caching decorator around {@link FeignUserServiceClient}.
 * <p>
 * Architecture: L1 per-request ThreadLocal → L2 Caffeine (per service JVM) → HTTP → user-service origin cache → DB.
 */
@Service
@Primary
@Profile("!monolithic")
public class CachedUserServiceClient implements IUserServiceClient {

    private final FeignUserServiceClient delegate;
    private final UserProfileClientCacheStore cacheStore;
    private final ObjectProvider<JwtUtil> jwtUtil;

    public CachedUserServiceClient(
            FeignUserServiceClient delegate,
            UserProfileClientCacheStore cacheStore,
            ObjectProvider<JwtUtil> jwtUtil) {
        this.delegate = delegate;
        this.cacheStore = cacheStore;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDTO getUserProfile(String jwt) {
        String email = extractEmail(jwt);
        if (email != null) {
            UserDTO requestHit = ClientRequestUserCache.getByEmail(email);
            if (requestHit != null) {
                return requestHit;
            }
            UserDTO user = cacheStore.getByEmail(email, () -> delegate.getUserProfile(jwt));
            rememberAll(user);
            return user;
        }
        return delegate.getUserProfile(jwt);
    }

    @Override
    public UserDTO getUserById(Integer userId) {
        UserDTO requestHit = ClientRequestUserCache.getById(userId);
        if (requestHit != null) {
            return requestHit;
        }
        UserDTO user = cacheStore.getById(userId, () -> delegate.getUserById(userId));
        rememberAll(user);
        return user;
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return delegate.getAllUsers();
    }

    @Override
    public UserDTO findUserByEmail(String email) {
        UserDTO requestHit = ClientRequestUserCache.getByEmail(email);
        if (requestHit != null) {
            return requestHit;
        }
        UserDTO user = cacheStore.getByEmail(email, () -> delegate.findUserByEmail(email));
        rememberAll(user);
        return user;
    }

    private void rememberAll(UserDTO user) {
        ClientRequestUserCache.remember(user);
        cacheStore.remember(user);
    }

    private String extractEmail(String jwt) {
        if (jwt == null || jwt.isBlank()) {
            return null;
        }
        JwtUtil util = jwtUtil.getIfAvailable();
        if (util == null) {
            return null;
        }
        try {
            return UserProfileClientCacheStore.normalizeEmail(util.extractEmail(jwt));
        } catch (Exception e) {
            return null;
        }
    }
}
