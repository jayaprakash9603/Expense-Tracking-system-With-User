package com.jaya.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableAsync;
import com.jaya.common.config.SharedAsyncConfig;

/**
 * Payment-method-Service async configuration.
 * friendActivityExecutor bean is now provided by SharedAsyncConfig in common-library.
 */
@Configuration
@EnableAsync
@Import(SharedAsyncConfig.class)
public class PaymentAsyncConfig {
    // friendActivityExecutor moved to common-library SharedAsyncConfig
}
