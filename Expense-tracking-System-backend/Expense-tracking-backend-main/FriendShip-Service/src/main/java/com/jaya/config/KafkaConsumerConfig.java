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

@Configuration
@EnableKafka
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${kafka.consumer.group-id:friendship-activity-group}")
    private String groupId;

    @Autowired
    private ObjectMapper objectMapper;

    @Bean
    public ConsumerFactory<String, FriendActivityEvent> friendActivityConsumerFactory() {
        Map<String, Object> configProps = new HashMap<>();

        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        configProps.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 100);
        configProps.put(ConsumerConfig.FETCH_MIN_BYTES_CONFIG, 1);
        configProps.put(ConsumerConfig.FETCH_MAX_WAIT_MS_CONFIG, 500);

        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        JsonDeserializer<FriendActivityEvent> jsonDeserializer = new JsonDeserializer<>(FriendActivityEvent.class,
                objectMapper);
        jsonDeserializer.setRemoveTypeHeaders(true);
        jsonDeserializer.addTrustedPackages("com.jaya.kafka.events", "*");
        jsonDeserializer.setUseTypeMapperForKey(false);

        return new DefaultKafkaConsumerFactory<>(configProps,
                new StringDeserializer(),
                jsonDeserializer);
    }

    @Bean("friendActivityKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<String, FriendActivityEvent> friendActivityKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, FriendActivityEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(friendActivityConsumerFactory());

        factory.setConcurrency(1);

        factory.setBatchListener(false);

        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);
        factory.getContainerProperties().setPollTimeout(3000);

        return factory;
    }
}
