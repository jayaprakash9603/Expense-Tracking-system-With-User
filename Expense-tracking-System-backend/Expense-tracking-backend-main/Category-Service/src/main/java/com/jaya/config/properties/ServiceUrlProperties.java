package com.jaya.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@Configuration
@ConfigurationProperties(prefix = "services")
public class ServiceUrlProperties {

    private ServiceConfig expense = new ServiceConfig();
    private ServiceConfig user = new ServiceConfig();
    private ServiceConfig friendship = new ServiceConfig();

    @Data
    public static class ServiceConfig {
        private String url = "http://localhost:6000";
        private int connectTimeout = 5000;
        private int readTimeout = 10000;
        private int retryAttempts = 3;
    }
}
