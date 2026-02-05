package com.jaya.ratelimit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
@Service
public class InMemoryRateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(InMemoryRateLimiterService.class);

    private final Map<String, Window> windows = new ConcurrentHashMap<>();
    private final RateLimitProperties properties;

    public InMemoryRateLimiterService(RateLimitProperties properties) {
        this.properties = properties;
    }

    public boolean tryConsume(String key) {
        if (!properties.isEnabled())
            return true;
        int limit = properties.getRequests();
        long windowMillis = properties.getWindowSeconds() * 1000L;
        long now = Instant.now().toEpochMilli();
        Window w = windows.compute(key, (k, existing) -> {
            if (existing == null || now - existing.start >= windowMillis) {
                return new Window(now, 1);
            }
            if (existing.count < limit) {
                existing.count++;
                return existing;
            }
            return existing;
        });
        boolean allowed = w.count <= limit;
        if (!allowed) {
            log.debug("Rate limit exceeded for key={} count={} limit={} windowSeconds={}", key, w.count, limit,
                    properties.getWindowSeconds());
        }
        return allowed;
    }

    public int remaining(String key) {
        int limit = properties.getRequests();
        Window w = windows.get(key);
        if (w == null)
            return limit;
        return Math.max(0, limit - w.count);
    }

    private static class Window {
        long start;
        int count;

        Window(long start, int count) {
            this.start = start;
            this.count = count;
        }
    }
}
