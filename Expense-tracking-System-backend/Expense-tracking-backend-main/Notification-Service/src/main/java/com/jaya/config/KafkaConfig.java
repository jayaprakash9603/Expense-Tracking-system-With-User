package com.jaya.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka Configuration for Notification Service
 * Configures consumers for all event types from different services
 */
@Configuration
@EnableKafka
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    /**
     * ObjectMapper with JavaTimeModule for proper LocalDateTime serialization
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    /**
     * Producer Factory for sending notification events (if needed)
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    // =========================
    // CONSUMER FACTORIES
    // =========================

    /**
     * Generic Consumer Factory for all event types with ErrorHandlingDeserializer
     */
    private ConsumerFactory<String, Object> createConsumerFactory(String groupId) {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);

        // Use ErrorHandlingDeserializer to handle deserialization errors
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);

        // Delegate to actual deserializers
        props.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);

        // JsonDeserializer configuration
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "java.util.LinkedHashMap");

        // Consumer configuration
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 100);

        return new DefaultKafkaConsumerFactory<>(props);
    }

    /**
     * Expense Event Consumer Factory
     */
    @Bean
    public ConsumerFactory<String, Object> expenseEventConsumerFactory() {
        return createConsumerFactory("notification-expense-group");
    }

    /**
     * Bill Event Consumer Factory
     */
    @Bean
    public ConsumerFactory<String, Object> billEventConsumerFactory() {
        return createConsumerFactory("notification-bill-group");
    }

    /**
     * Budget Event Consumer Factory
     */
    @Bean
    public ConsumerFactory<String, Object> budgetEventConsumerFactory() {
        return createConsumerFactory("notification-budget-group");
    }

    /**
     * Category Event Consumer Factory
     */
    @Bean
    public ConsumerFactory<String, Object> categoryEventConsumerFactory() {
        return createConsumerFactory("notification-category-group");
    }

    /**
     * Payment Method Event Consumer Factory
     */
    @Bean
    public ConsumerFactory<String, Object> paymentMethodEventConsumerFactory() {
        return createConsumerFactory("notification-payment-method-group");
    }

    /**
     * Friend Event Consumer Factory
     */
    @Bean
    public ConsumerFactory<String, Object> friendEventConsumerFactory() {
        return createConsumerFactory("notification-friend-group");
    }

    /**
     * Friend Request Event Consumer Factory
     */
    @Bean
    public ConsumerFactory<String, Object> friendRequestEventConsumerFactory() {
        return createConsumerFactory("notification-friend-request-group");
    }

    // =========================
    // LISTENER CONTAINER FACTORIES
    // =========================

    /**
     * Default Kafka Listener Container Factory
     */
    @Bean
    @Primary
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(expenseEventConsumerFactory());
        return factory;
    }

    /**
     * Expense Event Listener Container Factory
     */
    @Bean("expenseEventKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> expenseEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(expenseEventConsumerFactory());
        factory.setConcurrency(3); // Run 3 concurrent consumers
        factory.getContainerProperties().setPollTimeout(1000);
        return factory;
    }

    /**
     * Bill Event Listener Container Factory
     */
    @Bean("billEventKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> billEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(billEventConsumerFactory());
        factory.setConcurrency(3); // Run 3 concurrent consumers
        factory.getContainerProperties().setPollTimeout(1000);
        return factory;
    }

    /**
     * Budget Event Listener Container Factory
     */
    @Bean("budgetEventKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> budgetEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(budgetEventConsumerFactory());
        factory.setConcurrency(3); // Run 3 concurrent consumers
        factory.getContainerProperties().setPollTimeout(1000);
        return factory;
    }

    /**
     * Category Event Listener Container Factory
     */
    @Bean("categoryEventKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> categoryEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(categoryEventConsumerFactory());
        factory.setConcurrency(3); // Run 3 concurrent consumers
        factory.getContainerProperties().setPollTimeout(1000);
        return factory;
    }

    /**
     * Payment Method Event Listener Container Factory
     */
    @Bean("paymentMethodEventKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> paymentMethodEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(paymentMethodEventConsumerFactory());
        factory.setConcurrency(3); // Run 3 concurrent consumers
        factory.getContainerProperties().setPollTimeout(1000);
        return factory;
    }

    /**
     * Friend Event Listener Container Factory
     */
    @Bean("friendEventKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> friendEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(friendEventConsumerFactory());
        factory.setConcurrency(3); // Run 3 concurrent consumers
        factory.getContainerProperties().setPollTimeout(1000);
        return factory;
    }

    /**
     * Friend Request Event Listener Container Factory
     */
    @Bean("friendRequestEventKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> friendRequestEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(friendRequestEventConsumerFactory());
        factory.setConcurrency(3); // Run 3 concurrent consumers
        factory.getContainerProperties().setPollTimeout(1000);
        return factory;
    }

}
