package com.jaya.common.cache;

import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class RedisKeyValueStoreAdapter implements KeyValueStorePort {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisKeyValueStoreAdapter(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    @Override
    public void set(String key, Object value, Duration ttl) {
        redisTemplate.opsForValue().set(key, value, ttl.toMillis(), TimeUnit.MILLISECONDS);
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> Optional<T> get(String key, Class<T> type) {
        Object value = redisTemplate.opsForValue().get(key);
        if (value == null) return Optional.empty();
        return Optional.of((T) value);
    }

    @Override
    public void delete(String key) {
        redisTemplate.delete(key);
    }

    @Override
    public boolean hasKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    @Override
    public void addToSet(String key, String... values) {
        redisTemplate.opsForSet().add(key, (Object[]) values);
    }

    @Override
    public void removeFromSet(String key, String... values) {
        redisTemplate.opsForSet().remove(key, (Object[]) values);
    }

    @Override
    public Set<String> getSetMembers(String key) {
        Set<Object> members = redisTemplate.opsForSet().members(key);
        if (members == null) return Collections.emptySet();
        return members.stream()
                .map(Object::toString)
                .collect(Collectors.toSet());
    }

    @Override
    public void setHashField(String key, String field, Object value) {
        redisTemplate.opsForHash().put(key, field, value);
    }

    @Override
    public Object getHashField(String key, String field) {
        return redisTemplate.opsForHash().get(key, field);
    }

    @Override
    public Map<Object, Object> getHash(String key) {
        return redisTemplate.opsForHash().entries(key);
    }

    @Override
    public void deleteHashField(String key, String... fields) {
        redisTemplate.opsForHash().delete(key, (Object[]) fields);
    }
}
