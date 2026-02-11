package com.jaya.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.dto.ExpenseBudgetLinkingEvent;
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
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Configuration
@EnableKafka
@ConditionalOnProperty(name = "kafka.enabled", havingValue = "true", matchIfMissing = true)
public class ExpenseKafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    
    @Bean
    @Primary
    public ProducerFactory<String, String> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    
    @Bean
    public ProducerFactory<String, Object> objectProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);
        
        
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    
    @Bean
    @Primary
    public KafkaTemplate<String, String> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    
    @Bean("objectKafkaTemplate")
    public KafkaTemplate<String, Object> objectKafkaTemplate() {
        return new KafkaTemplate<>(objectProducerFactory());
    }

    
    @Bean
    public ConsumerFactory<String, String> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "expense-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        return new DefaultKafkaConsumerFactory<>(props);
    }

    
    @Bean
    public ConsumerFactory<String, Object> objectConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "payment-method-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.jaya.dto.PaymentMethodEvent");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        
        return new DefaultKafkaConsumerFactory<>(props);
    }

    
    @Bean
    public ConsumerFactory<String, Object> budgetExpenseConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "BudgetModel-expense-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.jaya.events.BudgetExpenseEvent");
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        
        return new DefaultKafkaConsumerFactory<>(props);
    }

    
    @Bean
    public ConsumerFactory<String, Object> categoryEventConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "category-expense-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.jaya.events.CategoryExpenseEvent");
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        
        return new DefaultKafkaConsumerFactory<>(props);
    }

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    
    @Bean
    @Primary
    public ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, String> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }

    
    @Bean("objectKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> objectKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(objectConsumerFactory());
        return factory;
    }

    
    @Bean("budgetExpenseKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> budgetExpenseKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(budgetExpenseConsumerFactory());
        return factory;
    }

    
    @Bean("categoryEventKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, Object> categoryEventKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(categoryEventConsumerFactory());
        return factory;
    }

    
    @Bean
    public ConsumerFactory<String, ExpenseBudgetLinkingEvent> expenseBudgetLinkingConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "expense-service-linking-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);

        
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class.getName());

        props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.jaya.dto.ExpenseBudgetLinkingEvent");
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "com.jaya.dto,com.jaya.events");
        props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(),
                new ErrorHandlingDeserializer<>(new JsonDeserializer<>(ExpenseBudgetLinkingEvent.class)));
    }

    
    @Bean("expenseBudgetLinkingKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, ExpenseBudgetLinkingEvent> expenseBudgetLinkingKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, ExpenseBudgetLinkingEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(expenseBudgetLinkingConsumerFactory());
        return factory;
    }
}

