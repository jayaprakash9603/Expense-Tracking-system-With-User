package com.jaya.controller;

import com.jaya.service.KafkaProducerService;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.TimeUnit;
import java.util.Collections;

@RestController
@RequestMapping("/kafka")
public class ProducerController {
    private final KafkaProducerService producerService;

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    public ProducerController(KafkaProducerService producerService) {
        this.producerService = producerService;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendMessage(@RequestBody String message) {
        try {
            producerService.sendMessage(message);
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "ExpenseMessage sent to Kafka: " + message);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send message: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }





    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkKafkaHealth() {
        try {
            Properties props = new Properties();
            props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
            props.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 10000);
            props.put(AdminClientConfig.CONNECTIONS_MAX_IDLE_MS_CONFIG, 15000);
            props.put(AdminClientConfig.RETRIES_CONFIG, 3);

            try (AdminClient adminClient = AdminClient.create(props)) {
                var topics = adminClient.listTopics().names().get(10, TimeUnit.SECONDS);
                Map<String, Object> response = new HashMap<>();
                response.put("status", "healthy");
                response.put("message", "Kafka is running and accessible");
                response.put("topicsCount", topics.size());
                response.put("topics", topics);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "unhealthy");
            response.put("message", "Kafka is not accessible: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, String>> getKafkaInfo() {
        Map<String, String> info = new HashMap<>();
        info.put("bootstrapServers", bootstrapServers);
        info.put("kafkaUI", "http://localhost:8090");
        info.put("note", "Make sure Kafka UI is running on port 8090");
        return ResponseEntity.ok(info);
    }

    @PostMapping("/topics/{topicName}")
    public ResponseEntity<Map<String, String>> createTopic(
            @PathVariable String topicName,
            @RequestParam(defaultValue = "1") int partitions,
            @RequestParam(defaultValue = "1") short replicationFactor) {
        try {
            Properties props = new Properties();
            props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);

            try (AdminClient adminClient = AdminClient.create(props)) {
                NewTopic newTopic = new NewTopic(topicName, partitions, replicationFactor);
                adminClient.createTopics(Collections.singletonList(newTopic)).all().get(30, TimeUnit.SECONDS);

                Map<String, String> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Topic '" + topicName + "' created successfully");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to create topic: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/topics")
    public ResponseEntity<Map<String, Object>> listTopics() {
        try {
            Properties props = new Properties();
            props.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);

            try (AdminClient adminClient = AdminClient.create(props)) {
                var topics = adminClient.listTopics().names().get(10, TimeUnit.SECONDS);
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("topics", topics);
                response.put("count", topics.size());
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to list topics: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

