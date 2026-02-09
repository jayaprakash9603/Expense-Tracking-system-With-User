package com.jaya.config;

import com.jaya.common.config.SharedMailConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * Payment service mail configuration.
 * Imports shared mail config from common-library.
 */
@Configuration
@Import(SharedMailConfig.class)
public class PaymentMailConfig {
    // Uses shared javaMailSender from SharedMailConfig
}
