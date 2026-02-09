package com.jaya.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import com.jaya.common.config.SharedAsyncConfig;

import java.util.concurrent.ThreadPoolExecutor;

/**
 * Expense-Service async configuration.
 * friendActivityExecutor bean is now provided by SharedAsyncConfig in common-library.
 */
@Configuration
@EnableAsync
@Import(SharedAsyncConfig.class)
public class ExpenseAsyncConfig {

    @Bean(name = "expensePostExecutor")
    public ThreadPoolTaskExecutor expensePostExecutor() {
        int cores = Math.max(4, Runtime.getRuntime().availableProcessors());
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(Math.min(cores, 8));
        ex.setMaxPoolSize(Math.min(cores * 2, 16));
        ex.setQueueCapacity(10000);
        ex.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        ex.setAllowCoreThreadTimeOut(true);
        ex.setKeepAliveSeconds(60);
        ex.setThreadNamePrefix("ExpenseAsync-");
        ex.initialize();
        return ex;
    }
    // friendActivityExecutor moved to common-library SharedAsyncConfig
}