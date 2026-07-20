package com.jaya.task.user.service.cache;

import com.jaya.task.user.service.service.UserProfileCacheService;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

/**
 * Bridges JPA entity listeners (non-Spring) to {@link UserProfileCacheStore}.
 */
@Component
public class UserCacheEvictor {

    private static volatile UserProfileCacheStore cacheStore;

    public UserCacheEvictor(UserProfileCacheStore store) {
        UserCacheEvictor.cacheStore = store;
    }

    public static void evict(@Nullable Integer userId, @Nullable String email) {
        UserProfileCacheStore store = cacheStore;
        if (store != null) {
            store.evict(userId, email);
        }
    }
}
