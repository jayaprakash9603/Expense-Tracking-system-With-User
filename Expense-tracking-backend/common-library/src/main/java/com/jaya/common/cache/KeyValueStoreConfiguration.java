package com.jaya.common.cache;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class KeyValueStoreConfiguration {

    @Bean
    @ConditionalOnClass(RedisTemplate.class)
    @ConditionalOnBean(RedisTemplate.class)
    @ConditionalOnProperty(name = "redis.enabled", havingValue = "true", matchIfMissing = true)
    public KeyValueStorePort redisKeyValueStore(RedisTemplate<String, Object> redisTemplate) {
        return new RedisKeyValueStoreAdapter(redisTemplate);
    }

    @Bean
    @ConditionalOnMissingBean(KeyValueStorePort.class)
    public KeyValueStorePort inMemoryKeyValueStore() {
        return new InMemoryKeyValueAdapter();
    }
}
