package com.jaya.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

/**
 * Cache configuration for FriendShip-Service
 * Uses in-memory caching to reduce database queries for frequently accessed
 * data
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
                new ConcurrentMapCache("friendships"), // Cache for friendship lookups
                new ConcurrentMapCache("friendshipStatus"), // Cache for status checks
                new ConcurrentMapCache("accessLevels") // Cache for access level checks
        ));
        return cacheManager;
    }
}
