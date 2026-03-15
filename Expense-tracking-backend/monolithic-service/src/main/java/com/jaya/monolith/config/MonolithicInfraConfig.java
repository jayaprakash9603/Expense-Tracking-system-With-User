package com.jaya.monolith.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
public class MonolithicInfraConfig {

    @Configuration
    @ConditionalOnProperty(name = "kafka.enabled", havingValue = "true")
    @Import(KafkaAutoConfiguration.class)
    static class KafkaEnabled {
    }

    @Configuration
    @ConditionalOnProperty(name = "redis.enabled", havingValue = "true")
    @Import({RedisAutoConfiguration.class, RedisRepositoriesAutoConfiguration.class})
    static class RedisEnabled {
    }
}
