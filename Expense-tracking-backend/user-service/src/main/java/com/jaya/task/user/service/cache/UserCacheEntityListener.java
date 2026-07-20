package com.jaya.task.user.service.cache;

import com.jaya.task.user.service.modal.User;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;

/**
 * Invalidates cached profiles whenever a {@link User} is inserted, updated or removed.
 */
public class UserCacheEntityListener {

    @PostPersist
    @PostUpdate
    @PostRemove
    public void evictUserCache(User user) {
        if (user != null) {
            UserCacheEvictor.evict(user.getId(), user.getEmail());
        }
    }
}
