package com.jaya.monolith.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Cache configuration for monolithic mode.
 * Provides a single CacheManager that creates caches on demand (e.g. userSettings
 * used by Expense-Service UserSettingsServiceImpl), avoiding "Cannot find cache
 * named 'userSettings'" when multiple services are combined.
 */
@Configuration
@EnableCaching
public class MonolithicCacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
}
