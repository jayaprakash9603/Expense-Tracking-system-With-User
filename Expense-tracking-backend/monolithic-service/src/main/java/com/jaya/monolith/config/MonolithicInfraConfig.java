package com.jaya.monolith.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.messaging.Message;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Configuration
public class MonolithicInfraConfig {

    @Configuration
    @ConditionalOnProperty(name = "kafka.enabled", havingValue = "true")
    @Import(KafkaAutoConfiguration.class)
    static class KafkaEnabled {
    }

    @Configuration
    @ConditionalOnProperty(name = "kafka.enabled", havingValue = "false")
    static class KafkaDisabledCompatibility {

        @Bean
        @ConditionalOnMissingBean(KafkaTemplate.class)
        @SuppressWarnings({ "rawtypes", "unchecked" })
        public KafkaTemplate kafkaTemplate() {
            return new NoOpKafkaTemplate(new DefaultKafkaProducerFactory<>(kafkaProducerConfig()));
        }

        private Map<String, Object> kafkaProducerConfig() {
            Map<String, Object> config = new HashMap<>();
            config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
            config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
            config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
            config.put(ProducerConfig.ACKS_CONFIG, "0");
            config.put(ProducerConfig.RETRIES_CONFIG, 0);
            return config;
        }

        private static final class NoOpKafkaTemplate extends KafkaTemplate<String, Object> {

            private NoOpKafkaTemplate(DefaultKafkaProducerFactory<String, Object> producerFactory) {
                super(producerFactory);
            }

            private CompletableFuture<SendResult<String, Object>> done() {
                return CompletableFuture.completedFuture(null);
            }

            @Override
            public CompletableFuture<SendResult<String, Object>> send(String topic, Object data) {
                return done();
            }

            @Override
            public CompletableFuture<SendResult<String, Object>> send(String topic, String key, Object data) {
                return done();
            }

            @Override
            public CompletableFuture<SendResult<String, Object>> send(String topic, Integer partition, String key,
                    Object data) {
                return done();
            }

            @Override
            public CompletableFuture<SendResult<String, Object>> send(String topic, Integer partition, Long timestamp,
                    String key, Object data) {
                return done();
            }

            @Override
            public CompletableFuture<SendResult<String, Object>> send(ProducerRecord<String, Object> record) {
                return done();
            }

            @Override
            public CompletableFuture<SendResult<String, Object>> send(Message<?> message) {
                return done();
            }
        }
    }

    @Configuration
    @ConditionalOnProperty(name = "redis.enabled", havingValue = "true")
    @Import({RedisAutoConfiguration.class, RedisRepositoriesAutoConfiguration.class})
    static class RedisEnabled {
    }
}
