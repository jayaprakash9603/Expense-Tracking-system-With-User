package com.jaya.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Shared async configuration for all services.
 * This consolidates duplicate executor beans that were defined across multiple services.
 * 
 * Used by: Expense-Service, Budget-Service, Category-Service, Bill-Service,
 *          Payment-method-Service, FriendShip-Service
 */
@Configuration
public class SharedAsyncConfig {

    /**
     * Shared executor for friend activity processing.
     * Consolidates duplicate friendActivityExecutor beans from 6 services.
     */
    @Bean(name = "friendActivityExecutor")
    @Primary
    public Executor friendActivityExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("friend-activity-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
