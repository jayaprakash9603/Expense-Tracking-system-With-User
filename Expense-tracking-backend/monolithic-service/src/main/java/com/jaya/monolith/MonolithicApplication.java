package com.jaya.monolith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = {
                KafkaAutoConfiguration.class,
                RedisAutoConfiguration.class,
                RedisRepositoriesAutoConfiguration.class
})
@EnableAsync
@EnableScheduling
@EnableFeignClients(basePackages = {
                "com.jaya.service",
                "com.jaya.service.client",
                "com.jaya.common.service.client.feign",
                "com.jaya.task.user.service.service"
})
@ComponentScan(basePackages = {
                "com.jaya",
                "com.jaya.task.user.service"
}, excludeFilters = {
                @ComponentScan.Filter(type = org.springframework.context.annotation.FilterType.REGEX, pattern = "com\\.jaya\\.config\\.JpaQueryOptimizationConfig"),
                @ComponentScan.Filter(type = org.springframework.context.annotation.FilterType.REGEX, pattern = "com\\.jaya\\.config\\.NoOpCacheConfig"),
                @ComponentScan.Filter(type = org.springframework.context.annotation.FilterType.REGEX, pattern = "com\\.jaya\\.config\\.CacheConfig")
})
@EntityScan(basePackages = {
                "com.jaya"
})
@EnableJpaRepositories(basePackages = {
                "com.jaya"
})
public class MonolithicApplication {

        public static void main(String[] args) {
                System.setProperty("spring.profiles.active", "monolithic");
                SpringApplication.run(MonolithicApplication.class, args);
        }
}
