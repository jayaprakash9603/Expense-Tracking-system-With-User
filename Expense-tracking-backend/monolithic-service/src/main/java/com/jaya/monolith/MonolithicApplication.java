package com.jaya.monolith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Monolithic entry point for the Expense Tracking System.
 * This application combines all microservices into a single deployable unit.
 * 
 * Run with profile: -Dspring.profiles.active=monolithic
 * 
 * Features:
 * - Single database schema (expense_tracker_monolith)
 * - No Eureka service discovery required
 * - All services communicate via direct method calls
 * - Kafka can be optional (use in-memory events)
 */
@SpringBootApplication
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
