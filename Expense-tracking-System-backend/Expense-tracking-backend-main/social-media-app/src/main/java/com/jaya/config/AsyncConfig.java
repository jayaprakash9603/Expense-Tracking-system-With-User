package com.jaya.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

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

    @Bean(name = "friendActivityExecutor")
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