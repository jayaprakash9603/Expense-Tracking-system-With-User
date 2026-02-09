package com.jaya.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import com.jaya.common.config.SharedAsyncConfig;

/**
 * FriendShip-Service async configuration.
 * friendActivityExecutor bean is now provided by SharedAsyncConfig in common-library.
 */
@Configuration
@EnableAsync
@Import(SharedAsyncConfig.class)
public class FriendshipAsyncConfig {
    
    @Bean(name = "friendshipTaskExecutor")
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("friendship-async-");
        executor.initialize();
        return executor;
    }
    // friendActivityExecutor moved to common-library SharedAsyncConfig
}
