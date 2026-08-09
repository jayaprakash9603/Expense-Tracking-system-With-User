package com.jaya.common.config;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Profile;

/**
 * Registers shared Feign clients from {@code com.jaya.common.service.client.feign}.
 *
 * <p><b>Important:</b> Consuming services must NOT use a bare {@code @EnableFeignClients}
 * on an application class under {@code com.jaya}. That scans the same common package again
 * and causes {@code BeanDefinitionOverrideException} for
 * {@code *.FeignClientSpecification} beans (e.g. {@code commonBillServiceClient}).
 *
 * <p>Use one of:
 * <ul>
 *   <li>Omit {@code @EnableFeignClients} if the service has no local Feign clients
 *       (this auto-config is enough), or</li>
 *   <li>Scope local clients explicitly, e.g.
 *       {@code @EnableFeignClients(basePackages = "com.jaya.service")}.</li>
 * </ul>
 */
@AutoConfiguration
@Profile("!monolithic")
@ConditionalOnClass(name = "org.springframework.cloud.openfeign.FeignClient")
@ConditionalOnProperty(name = "common-library.feign.enabled", havingValue = "true", matchIfMissing = true)
@EnableFeignClients(basePackages = "com.jaya.common.service.client.feign")
public class CommonFeignClientsAutoConfiguration {
}
