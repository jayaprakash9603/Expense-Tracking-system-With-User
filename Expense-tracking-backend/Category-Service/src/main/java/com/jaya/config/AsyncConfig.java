package com.jaya.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import com.jaya.common.config.SharedAsyncConfig;

import java.util.concurrent.Executor;

/**
 * Category-Service async configuration.
 * friendActivityExecutor bean is now provided by SharedAsyncConfig in common-library.
 */
@Configuration
@EnableAsync
@Import(SharedAsyncConfig.class)
public class CategoryAsyncConfig {

    @Bean(name = "categoryTaskExecutor")
    public Executor categoryTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(1000);
        executor.setThreadNamePrefix("category-async-");
        executor.initialize();
        return executor;
    }
    // friendActivityExecutor moved to common-library SharedAsyncConfig
}
