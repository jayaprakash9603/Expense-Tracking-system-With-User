package com.jaya.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.FriendActivityEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka Consumer Configuration for Friendship Service.
 * Configures Kafka consumers for receiving friend activity events from other
 * services.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles Kafka consumer configuration
 * - Dependency Inversion: Provides ConsumerFactory abstraction
 */
@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${kafka.consumer.group-id:friendship-activity-group}")
    private String groupId;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Configure Kafka Consumer Factory for FriendActivityEvent.
     */
    @Bean
    public ConsumerFactory<String, FriendActivityEvent> friendActivityConsumerFactory() {
        Map<String, Object> configProps = new HashMap<>();

        // Basic configuration
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        // Performance settings
        configProps.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 100);
        configProps.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1);
        configProps.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500);

        // Key deserializer
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        // Create deserializers programmatically (not via config properties)
        JsonDeserializer<FriendActivityEvent> jsonDeserializer = new JsonDeserializer<>(FriendActivityEvent.class,
                objectMapper);
        jsonDeserializer.setRemoveTypeHeaders(true);
        jsonDeserializer.addTrustedPackages("com.jaya.kafka.events", "*");
        jsonDeserializer.setUseTypeMapperForKey(false);

        return new DefaultKafkaConsumerFactory<>(configProps,
                new StringDeserializer(),
                jsonDeserializer);
    }

    /**
     * Configure Kafka Listener Container Factory.
     * This is used by @KafkaListener annotations.
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, FriendActivityEvent> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, FriendActivityEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(friendActivityConsumerFactory());

        // Concurrency settings - number of consumer threads
        factory.setConcurrency(1);

        // Batch processing settings
        factory.setBatchListener(false);

        // Container properties
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.RECORD);
        factory.getContainerProperties().setPollTimeout(3000);

        return factory;
    }
}
