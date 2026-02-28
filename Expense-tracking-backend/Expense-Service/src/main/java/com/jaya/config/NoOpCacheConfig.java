package com.jaya.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.cache.CacheManager;
import org.springframework.cache.support.NoOpCacheManager;


@Configuration
@Profile("!monolithic")
public class NoOpCacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new NoOpCacheManager();
    }
}
