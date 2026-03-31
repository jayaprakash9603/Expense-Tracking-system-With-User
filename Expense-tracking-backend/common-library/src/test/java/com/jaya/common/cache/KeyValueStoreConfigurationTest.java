package com.jaya.common.cache;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.test.context.FilteredClassLoader;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class KeyValueStoreConfigurationTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withConfiguration(AutoConfigurations.of(KeyValueStoreConfiguration.class));

    @Test
    void fallsBackToInMemoryStoreWhenRedisIsNotOnClasspath() {
        contextRunner
                .withClassLoader(new FilteredClassLoader("org.springframework.data.redis"))
                .run(context -> {
                    assertThat(context).hasSingleBean(KeyValueStorePort.class);
                    assertThat(context.getBean(KeyValueStorePort.class)).isInstanceOf(InMemoryKeyValueAdapter.class);
                });
    }

    @Test
    void usesRedisBackedStoreWhenRedisTemplateBeanExists() {
        contextRunner
                .withBean("redisTemplate", RedisTemplate.class, () -> mock(RedisTemplate.class))
                .run(context -> {
                    assertThat(context).hasSingleBean(KeyValueStorePort.class);
                    assertThat(context.getBean(KeyValueStorePort.class)).isInstanceOf(RedisKeyValueStoreAdapter.class);
                });
    }

    @Test
    void prefersNamedRedisTemplateWhenMultipleRedisTemplateBeansExist() {
        contextRunner
                .withBean("redisTemplate", RedisTemplate.class, () -> mock(RedisTemplate.class))
                .withBean("stringRedisTemplate", StringRedisTemplate.class, () -> mock(StringRedisTemplate.class))
                .run(context -> {
                    assertThat(context).hasSingleBean(KeyValueStorePort.class);

                    Object delegate = ReflectionTestUtils.getField(context.getBean(KeyValueStorePort.class),
                            "redisTemplate");
                    assertThat(delegate).isSameAs(context.getBean("redisTemplate"));
                });
    }

    @Test
    void fallsBackToInMemoryStoreWhenRedisSupportIsDisabled() {
        contextRunner
                .withPropertyValues("redis.enabled=false")
                .withBean("redisTemplate", RedisTemplate.class, () -> mock(RedisTemplate.class))
                .run(context -> {
                    assertThat(context).hasSingleBean(KeyValueStorePort.class);
                    assertThat(context.getBean(KeyValueStorePort.class)).isInstanceOf(InMemoryKeyValueAdapter.class);
                });
    }
}