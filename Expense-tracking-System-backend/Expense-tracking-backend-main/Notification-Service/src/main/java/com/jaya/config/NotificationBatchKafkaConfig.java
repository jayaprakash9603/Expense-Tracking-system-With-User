package com.jaya.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;

/**
 * Batch Kafka Configuration for Notification Service
 * Similar pattern to CategoryKafkaConfig - simple and effective batch
 * processing
 */
@Configuration
@EnableKafka
public class NotificationBatchKafkaConfig {

    @Value("${app.kafka.notification.concurrency:4}")
    private int concurrency;

    @Value("${spring.kafka.consumer.max-poll-records:500}")
    private int maxPollRecords;

    /**
     * Unified batch factory for all notification event types
     * Uses expenseEventConsumerFactory as the base (they all have same config)
     */
    @Bean(name = "notificationBatchFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> notificationBatchFactory(
            @Qualifier("expenseEventConsumerFactory") ConsumerFactory<String, Object> consumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setBatchListener(true); // Enable batch mode
        factory.setConcurrency(concurrency); // Concurrent consumers
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.BATCH);
        factory.getContainerProperties().setPollTimeout(3000L);

        // Ensure max poll records is configured
        factory.getContainerProperties().getKafkaConsumerProperties()
                .put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, String.valueOf(maxPollRecords));

        return factory;
    }
}
