// Java
package com.jaya.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "expensePostExecutor")
    public ThreadPoolTaskExecutor expensePostExecutor() {
        int cores = Math.max(4, Runtime.getRuntime().availableProcessors());
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(Math.min(cores, 8));
        ex.setMaxPoolSize(Math.min(cores * 2, 16));
        ex.setQueueCapacity(1000);
        ex.setAllowCoreThreadTimeOut(true);
        ex.setKeepAliveSeconds(60);
        ex.setThreadNamePrefix("ExpenseAsync-");
        ex.initialize();
        return ex;
    }
}