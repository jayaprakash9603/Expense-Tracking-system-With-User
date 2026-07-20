package com.jaya.common.config;

import com.jaya.common.cache.user.UserProfileCacheProperties;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;

@AutoConfiguration
@ConditionalOnClass(name = "org.springframework.cloud.openfeign.FeignClient")
@ConditionalOnProperty(name = "common-library.user-profile-cache.enabled", havingValue = "true", matchIfMissing = true)
@EnableConfigurationProperties(UserProfileCacheProperties.class)
@ComponentScan(basePackages = {
        "com.jaya.common.cache.user",
        "com.jaya.common.service.client"
})
public class UserProfileCacheAutoConfiguration {
}
