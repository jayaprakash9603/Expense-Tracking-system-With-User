package com.jaya.common.cache;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.util.ClassUtils;

@Configuration
@EnableScheduling
public class KeyValueStoreConfiguration {

    private static final String REDIS_TEMPLATE_CLASS_NAME = "org.springframework.data.redis.core.RedisTemplate";

    @Bean
    @ConditionalOnClass(name = REDIS_TEMPLATE_CLASS_NAME)
    @ConditionalOnBean(type = REDIS_TEMPLATE_CLASS_NAME)
    @ConditionalOnProperty(name = "redis.enabled", havingValue = "true", matchIfMissing = true)
    public KeyValueStorePort redisKeyValueStore(ApplicationContext applicationContext) {
        return createRedisKeyValueStore(applicationContext);
    }

    @Bean
    @ConditionalOnMissingBean(KeyValueStorePort.class)
    public KeyValueStorePort inMemoryKeyValueStore() {
        return new InMemoryKeyValueAdapter();
    }

    private KeyValueStorePort createRedisKeyValueStore(ApplicationContext applicationContext) {
        try {
            ClassLoader classLoader = applicationContext.getClassLoader();
            Class<?> redisTemplateClass = ClassUtils.forName(REDIS_TEMPLATE_CLASS_NAME, classLoader);
            Object redisTemplate = applicationContext.getBean(redisTemplateClass);
            return (KeyValueStorePort) RedisKeyValueStoreAdapter.class
                    .getConstructor(redisTemplateClass)
                    .newInstance(redisTemplate);
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException("Failed to initialize Redis-backed key value store", ex);
        }
    }
}
