package com.jaya.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableAsync;
import com.jaya.common.config.SharedAsyncConfig;

/**
 * Budget-Service async configuration.
 * friendActivityExecutor bean is now provided by SharedAsyncConfig in common-library.
 */
@Configuration
@EnableAsync
@Import(SharedAsyncConfig.class)
public class BudgetAsyncConfig {
    // friendActivityExecutor moved to common-library SharedAsyncConfig
}
