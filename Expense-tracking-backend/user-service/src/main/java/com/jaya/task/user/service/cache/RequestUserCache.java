package com.jaya.task.user.service.cache;

import com.jaya.task.user.service.modal.User;

import java.util.HashMap;
import java.util.Map;

/**
 * Per-request L1 cache so the security filter, controllers, and services
 * resolving the same user within one HTTP request share a single lookup.
 */
public final class RequestUserCache {

    private static final ThreadLocal<Map<String, User>> BY_EMAIL = ThreadLocal.withInitial(HashMap::new);
    private static final ThreadLocal<Map<Integer, User>> BY_ID = ThreadLocal.withInitial(HashMap::new);

    private RequestUserCache() {
    }

    public static User getByEmail(String email) {
        if (email == null) {
            return null;
        }
        return BY_EMAIL.get().get(email);
    }

    public static User getById(Integer userId) {
        if (userId == null) {
            return null;
        }
        return BY_ID.get().get(userId);
    }

    public static void putByEmail(String email, User user) {
        if (email != null && user != null) {
            BY_EMAIL.get().put(email, user);
        }
    }

    public static void putById(Integer userId, User user) {
        if (userId != null && user != null) {
            BY_ID.get().put(userId, user);
        }
    }

    public static void clear() {
        BY_EMAIL.remove();
        BY_ID.remove();
    }
}
