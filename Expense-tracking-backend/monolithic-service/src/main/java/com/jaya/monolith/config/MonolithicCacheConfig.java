package com.jaya.monolith.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Cache configuration for monolithic mode.
 * Implements CachingConfigurer to explicitly bind this CacheManager to the
 * {@code @Cacheable}/{@code @CacheEvict} infrastructure, preventing other
 * service CacheManager beans (e.g. FriendShip-Service's SimpleCacheManager)
 * from being used for cache resolution.
 *
 * The bean is named "monolithicCacheManager" to avoid being silently overridden
 * by other services that define a bean named "cacheManager" when
 * {@code spring.main.allow-bean-definition-overriding=true}.
 */
@Configuration
@EnableCaching
public class MonolithicCacheConfig implements CachingConfigurer {

    @Bean("monolithicCacheManager")
    @Primary
    public CacheManager monolithicCacheManager() {
        return new ConcurrentMapCacheManager();
    }

    @Override
    public CacheManager cacheManager() {
        return monolithicCacheManager();
    }
}
