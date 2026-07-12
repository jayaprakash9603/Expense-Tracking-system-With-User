package com.jaya.common.cache;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

public interface KeyValueStorePort {

    void set(String key, Object value);

    void set(String key, Object value, Duration ttl);

    <T> Optional<T> get(String key, Class<T> type);

    void delete(String key);

    boolean hasKey(String key);

    void addToSet(String key, String... values);

    void removeFromSet(String key, String... values);

    Set<String> getSetMembers(String key);

    void setHashField(String key, String field, Object value);

    Object getHashField(String key, String field);

    Map<Object, Object> getHash(String key);

    void deleteHashField(String key, String... fields);
}
