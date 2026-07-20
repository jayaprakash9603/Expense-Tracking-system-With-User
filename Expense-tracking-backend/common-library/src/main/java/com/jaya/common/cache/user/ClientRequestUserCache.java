package com.jaya.common.cache.user;

import com.jaya.common.dto.UserDTO;

import java.util.HashMap;
import java.util.Map;

/** L1 per-request cache for user profiles in consuming microservices. */
public final class ClientRequestUserCache {

    private static final ThreadLocal<Map<Integer, UserDTO>> BY_ID = ThreadLocal.withInitial(HashMap::new);
    private static final ThreadLocal<Map<String, UserDTO>> BY_EMAIL = ThreadLocal.withInitial(HashMap::new);

    private ClientRequestUserCache() {
    }

    public static UserDTO getById(Integer userId) {
        return userId == null ? null : BY_ID.get().get(userId);
    }

    public static UserDTO getByEmail(String email) {
        String key = UserProfileClientCacheStore.normalizeEmail(email);
        return key == null ? null : BY_EMAIL.get().get(key);
    }

    public static void remember(UserDTO user) {
        if (user == null) {
            return;
        }
        if (user.getId() != null) {
            BY_ID.get().put(user.getId(), user);
        }
        String email = UserProfileClientCacheStore.normalizeEmail(user.getEmail());
        if (email != null) {
            BY_EMAIL.get().put(email, user);
        }
    }

    public static void clear() {
        BY_ID.remove();
        BY_EMAIL.remove();
    }
}
