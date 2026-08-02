package com.jaya.common.config;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Profile;

@AutoConfiguration
@Profile("!monolithic")
@ConditionalOnClass(name = "org.springframework.cloud.openfeign.FeignClient")
@ConditionalOnProperty(name = "common-library.feign.enabled", havingValue = "true", matchIfMissing = true)
@EnableFeignClients(basePackages = "com.jaya.common.service.client.feign")
public class CommonFeignClientsAutoConfiguration {
}
