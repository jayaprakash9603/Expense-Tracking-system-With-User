package com.jaya.automation.core.context;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public final class ScenarioContext {
    private final Map<String, Object> values = new ConcurrentHashMap<>();

    public void put(String key, Object value) {
        values.put(key, value);
    }

    public <T> Optional<T> get(String key, Class<T> targetType) {
        Object value = values.get(key);
        if (value == null || !targetType.isInstance(value)) {
            return Optional.empty();
        }
        return Optional.of(targetType.cast(value));
    }

    public void remove(String key) {
        values.remove(key);
    }

    public void putAll(Map<String, ?> entries) {
        values.putAll(entries);
    }

    public Map<String, Object> snapshot() {
        return Map.copyOf(values);
    }

    public void clear() {
        values.clear();
    }
}
