# Kafka Troubleshooting Guide - Notification Service

## Common Kafka Issues and Solutions

### 1. SerializationException - No Type Information in Headers

#### Error Message
```
java.lang.IllegalStateException: This error handler cannot process 'SerializationException's directly; 
please consider configuring an 'ErrorHandlingDeserializer' in the value and/or key deserializer

Caused by: java.lang.IllegalStateException: No type information in headers and no default type provided
```

#### Root Cause
- Kafka messages produced by other services don't include type information in headers
- JsonDeserializer expects type headers but they're missing
- Consumer cannot determine which Java class to deserialize the JSON into

#### Solution ✅ (Already Implemented)

**1. Configure ErrorHandlingDeserializer**

```java
// In KafkaConfig.java
props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);

// Delegate to actual deserializers
props.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);
props.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);

// JsonDeserializer configuration
props.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
props.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
props.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "java.util.LinkedHashMap");
```

**2. Handle Both String and Object in Consumer**

```java
// In NotificationEventConsumer.java
private <T> T convertEventData(Object eventData, Class<T> targetClass) throws Exception {
    if (eventData instanceof String) {
        return objectMapper.readValue((String) eventData, targetClass);
    } else {
        return objectMapper.convertValue(eventData, targetClass);
    }
}

// Use in consumer methods
@KafkaListener(topics = "expense-events", ...)
public void consumeExpenseEvent(Object eventData) {
    ExpenseEventDTO event = convertEventData(eventData, ExpenseEventDTO.class);
    // Process event...
}
```

---

### 2. RecordDeserializationException - Error Deserializing Key/Value

#### Error Message
```
org.apache.kafka.common.errors.RecordDeserializationException: 
Error deserializing key/value for partition payment-method-events-0 at offset 637121
```

#### Root Cause
- Corrupted message in Kafka topic
- Invalid JSON format
- Incompatible schema changes

#### Solutions

**Option 1: Skip Bad Records (Quick Fix)**
```yaml
# application.yaml
spring:
  kafka:
    consumer:
      auto-offset-reset: latest  # Skip to latest messages
```

**Option 2: Reset Consumer Group Offset**
```bash
# Reset to earliest
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group notification-payment-method-group \
  --reset-offsets --to-earliest --topic payment-method-events --execute

# Reset to specific offset
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group notification-payment-method-group \
  --reset-offsets --to-offset 637122 --topic payment-method-events --execute
```

**Option 3: Delete and Recreate Topic (Development Only)**
```bash
# Delete topic
kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic payment-method-events

# Recreate topic
kafka-topics.sh --bootstrap-server localhost:9092 --create \
  --topic payment-method-events --partitions 3 --replication-factor 1
```

---

### 3. Consumer Lag - Messages Not Being Consumed

#### Symptoms
- Notifications delayed
- Messages piling up in topics
- Consumer not processing messages

#### Check Consumer Lag
```bash
# Check lag for all consumer groups
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# Check lag for specific group
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group notification-expense-group --describe
```

#### Solutions

**1. Increase Consumer Parallelism**
```yaml
# application.yaml
spring:
  kafka:
    listener:
      concurrency: 3  # Number of consumer threads per topic
```

**2. Increase Max Poll Records**
```java
// In KafkaConfig.java
props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 500);  // Process more records per poll
```

**3. Optimize Processing Time**
```java
// Use async processing
@Async
public void processNotificationAsync(Notification notification) {
    // Process notification
}
```

---

### 4. Connection Timeout - Cannot Connect to Kafka

#### Error Message
```
org.apache.kafka.common.errors.TimeoutException: 
Failed to update metadata after 60000 ms.
```

#### Root Cause
- Kafka broker not running
- Incorrect bootstrap server address
- Network/firewall issues

#### Solutions

**1. Check Kafka is Running**
```bash
# Check if Kafka is running
docker ps | grep kafka

# Start Kafka (Docker)
docker-compose up -d kafka

# Check Kafka logs
docker logs kafka-container
```

**2. Verify Bootstrap Server Configuration**
```yaml
# application.yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092  # or kafka:9092 in Docker
```

**3. Test Connection**
```bash
# Test connection using kafka-console-consumer
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic friend-request-events --from-beginning
```

---

### 5. Duplicate Message Processing

#### Symptoms
- Same notification created multiple times
- Duplicate WebSocket messages sent

#### Root Cause
- Consumer rebalancing
- Failed acknowledgment
- Exactly-once semantics not configured

#### Solutions

**1. Enable Idempotent Consumer**
```java
// Add unique identifier check
@Transactional
public Notification createNotification(Notification notification) {
    // Check if notification already exists
    Optional<Notification> existing = notificationRepository
        .findByUserIdAndTypeAndCreatedAt(
            notification.getUserId(), 
            notification.getType(), 
            notification.getCreatedAt()
        );
    
    if (existing.isPresent()) {
        return existing.get();  // Return existing, don't create duplicate
    }
    
    return notificationRepository.save(notification);
}
```

**2. Configure Consumer Offsets**
```yaml
# application.yaml
spring:
  kafka:
    consumer:
      enable-auto-commit: false  # Manual commit
      
# In consumer
@KafkaListener(...)
public void consume(ConsumerRecord<String, Object> record, Acknowledgment ack) {
    try {
        // Process message
        processEvent(record.value());
        ack.acknowledge();  // Manual acknowledgment
    } catch (Exception e) {
        // Don't acknowledge, will be reprocessed
    }
}
```

---

### 6. WebSocket Connection Issues

#### Error Message
```
WebSocket connection failed
Failed to send notification via WebSocket
```

#### Root Cause
- WebSocket not configured properly
- STOMP client not connected
- User session not found

#### Solutions

**1. Verify WebSocket Configuration**
```java
// WebSocketConfig.java should have
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}
```

**2. Add Error Handling in WebSocket Send**
```java
private void sendNotificationToUser(Notification notification) {
    try {
        String destination = "/topic/notifications/" + notification.getUserId();
        messagingTemplate.convertAndSend(destination, notification);
        log.info("Notification sent via WebSocket to user: {}", notification.getUserId());
    } catch (Exception e) {
        log.error("Failed to send notification via WebSocket: {}", e.getMessage());
        // Notification still saved in DB, user will see it when they login
    }
}
```

**3. Test WebSocket Connection**
```javascript
// In frontend
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, () => {
    console.log('WebSocket connected');
    
    stompClient.subscribe('/topic/notifications/' + userId, (message) => {
        console.log('Received notification:', JSON.parse(message.body));
    });
});
```

---

### 7. Topic Not Found Error

#### Error Message
```
org.apache.kafka.common.errors.UnknownTopicOrPartitionException: 
This server does not host this topic-partition.
```

#### Solutions

**1. Create Missing Topics**
```bash
# Create all required topics
kafka-topics.sh --bootstrap-server localhost:9092 --create \
  --topic expense-events --partitions 3 --replication-factor 1

kafka-topics.sh --bootstrap-server localhost:9092 --create \
  --topic bill-events --partitions 3 --replication-factor 1

kafka-topics.sh --bootstrap-server localhost:9092 --create \
  --topic budget-events --partitions 3 --replication-factor 1

kafka-topics.sh --bootstrap-server localhost:9092 --create \
  --topic category-events --partitions 3 --replication-factor 1

kafka-topics.sh --bootstrap-server localhost:9092 --create \
  --topic payment-method-events --partitions 3 --replication-factor 1

kafka-topics.sh --bootstrap-server localhost:9092 --create \
  --topic friend-events --partitions 3 --replication-factor 1

kafka-topics.sh --bootstrap-server localhost:9092 --create \
  --topic friend-request-events --partitions 3 --replication-factor 1
```

**2. Enable Auto Topic Creation (Development Only)**
```yaml
# docker-compose.yml or Kafka config
KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
```

**3. List All Topics**
```bash
# Check which topics exist
kafka-topics.sh --bootstrap-server localhost:9092 --list
```

---

## Monitoring and Debugging

### 1. Check Consumer Status
```bash
# List all consumer groups
kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list

# Describe consumer group
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \
  --group notification-expense-group --describe
```

### 2. View Messages in Topic
```bash
# View from beginning
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic friend-request-events --from-beginning

# View with keys
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic friend-request-events --property print.key=true --from-beginning
```

### 3. Check Topic Details
```bash
# Describe topic
kafka-topics.sh --bootstrap-server localhost:9092 \
  --topic friend-request-events --describe
```

### 4. Monitor Notification Service Logs
```bash
# Follow logs
docker logs -f notification-service

# Filter for errors
docker logs notification-service 2>&1 | grep ERROR

# Filter for specific topic
docker logs notification-service 2>&1 | grep "friend-request"
```

---

## Best Practices

### 1. Error Handling
```java
@KafkaListener(topics = "expense-events", ...)
public void consumeExpenseEvent(Object eventData) {
    try {
        ExpenseEventDTO event = convertEventData(eventData, ExpenseEventDTO.class);
        processExpenseEvent(event);
    } catch (DeserializationException e) {
        log.error("Deserialization error for event: {}", eventData, e);
        // Log to dead letter queue or skip
    } catch (Exception e) {
        log.error("Unexpected error processing event: {}", eventData, e);
        throw e;  // Retry or send to DLQ
    }
}
```

### 2. Dead Letter Queue (DLQ)
```java
// Configure DLQ in KafkaConfig
@Bean
public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
    ConcurrentKafkaListenerContainerFactory<String, Object> factory = 
        new ConcurrentKafkaListenerContainerFactory<>();
    
    // Configure error handler with DLQ
    factory.setCommonErrorHandler(new DefaultErrorHandler(
        new DeadLetterPublishingRecoverer(kafkaTemplate()),
        new FixedBackOff(1000L, 3)  // Retry 3 times with 1s delay
    ));
    
    return factory;
}
```

### 3. Health Checks
```java
@Component
public class KafkaHealthIndicator implements HealthIndicator {
    
    @Autowired
    private KafkaAdmin kafkaAdmin;
    
    @Override
    public Health health() {
        try {
            // Check if Kafka is accessible
            kafkaAdmin.describeCluster();
            return Health.up().withDetail("kafka", "Available").build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("kafka", "Unavailable")
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

---

## Quick Fixes Checklist

- [ ] Check Kafka is running: `docker ps | grep kafka`
- [ ] Verify topics exist: `kafka-topics.sh --list`
- [ ] Check consumer groups: `kafka-consumer-groups.sh --list`
- [ ] View messages in topic: `kafka-console-consumer.sh --from-beginning`
- [ ] Check application logs: `docker logs notification-service`
- [ ] Verify configuration: Check `application.yaml`
- [ ] Test WebSocket connection from frontend
- [ ] Check database for created notifications
- [ ] Verify Eureka service registration
- [ ] Check network connectivity between services

---

## Support Commands

### Reset Everything (Development Only)
```bash
# Stop all services
docker-compose down

# Remove Kafka data
docker volume rm kafka-data

# Restart services
docker-compose up -d

# Recreate topics
./create-topics.sh
```

### Performance Tuning
```yaml
# application.yaml
spring:
  kafka:
    consumer:
      max-poll-records: 500
      fetch-max-wait: 500ms
      fetch-min-size: 1024
    listener:
      concurrency: 3
      ack-mode: batch
```

---

## Related Documentation

- `NOTIFICATION_SERVICE_IMPLEMENTATION.md` - Complete implementation guide
- `KAFKA_TOPICS_REFERENCE.md` - Topic structure and schema
- `FRIEND_REQUEST_NOTIFICATION_GUIDE.md` - Friend request specific implementation
- `README.md` - Service overview

---

**Last Updated**: October 31, 2025
**Status**: ✅ All Issues Resolved
