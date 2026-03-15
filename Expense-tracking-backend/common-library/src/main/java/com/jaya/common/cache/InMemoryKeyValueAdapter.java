package com.jaya.common.cache;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
@ConditionalOnProperty(name = "redis.enabled", havingValue = "false")
@Slf4j
public class InMemoryKeyValueAdapter implements KeyValueStorePort {

    private final ConcurrentHashMap<String, Object> store = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Instant> expirations = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<String>> sets = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Map<String, Object>> hashes = new ConcurrentHashMap<>();

    @Override
    public void set(String key, Object value) {
        store.put(key, value);
        expirations.remove(key);
    }

    @Override
    public void set(String key, Object value, Duration ttl) {
        store.put(key, value);
        expirations.put(key, Instant.now().plus(ttl));
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> Optional<T> get(String key, Class<T> type) {
        if (isExpired(key)) {
            store.remove(key);
            expirations.remove(key);
            return Optional.empty();
        }
        Object value = store.get(key);
        if (value == null) return Optional.empty();
        return Optional.of((T) value);
    }

    @Override
    public void delete(String key) {
        store.remove(key);
        expirations.remove(key);
        sets.remove(key);
        hashes.remove(key);
    }

    @Override
    public boolean hasKey(String key) {
        if (isExpired(key)) {
            store.remove(key);
            expirations.remove(key);
            return false;
        }
        return store.containsKey(key) || sets.containsKey(key) || hashes.containsKey(key);
    }

    @Override
    public void addToSet(String key, String... values) {
        sets.computeIfAbsent(key, k -> ConcurrentHashMap.newKeySet())
                .addAll(Arrays.asList(values));
    }

    @Override
    public void removeFromSet(String key, String... values) {
        Set<String> set = sets.get(key);
        if (set != null) {
            set.removeAll(Arrays.asList(values));
        }
    }

    @Override
    public Set<String> getSetMembers(String key) {
        Set<String> set = sets.get(key);
        return set != null ? new HashSet<>(set) : Collections.emptySet();
    }

    @Override
    public void setHashField(String key, String field, Object value) {
        hashes.computeIfAbsent(key, k -> new ConcurrentHashMap<>())
                .put(field, value);
    }

    @Override
    public Object getHashField(String key, String field) {
        Map<String, Object> hash = hashes.get(key);
        return hash != null ? hash.get(field) : null;
    }

    @Override
    public Map<Object, Object> getHash(String key) {
        Map<String, Object> hash = hashes.get(key);
        if (hash == null) return Collections.emptyMap();
        return new HashMap<>(hash);
    }

    @Override
    public void deleteHashField(String key, String... fields) {
        Map<String, Object> hash = hashes.get(key);
        if (hash != null) {
            for (String field : fields) {
                hash.remove(field);
            }
        }
    }

    private boolean isExpired(String key) {
        Instant expiry = expirations.get(key);
        return expiry != null && Instant.now().isAfter(expiry);
    }

    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredEntries() {
        Instant now = Instant.now();
        List<String> expired = expirations.entrySet().stream()
                .filter(e -> now.isAfter(e.getValue()))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        for (String key : expired) {
            store.remove(key);
            expirations.remove(key);
        }

        if (!expired.isEmpty()) {
            log.debug("Cleaned up {} expired in-memory cache entries", expired.size());
        }
    }
}
