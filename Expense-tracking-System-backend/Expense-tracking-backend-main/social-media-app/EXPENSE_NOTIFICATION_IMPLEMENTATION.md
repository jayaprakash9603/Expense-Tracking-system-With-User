# Expense Notification Event Producer - Implementation Guide

## Overview

This implementation provides a reusable, SOLID-principles-based Kafka event producer system for sending expense notifications to the Notification Service.

## Architecture

### SOLID Principles Applied

1. **Single Responsibility Principle (SRP)**

   - `NotificationEventProducer`: Only handles Kafka message publishing
   - `ExpenseNotificationProducer`: Only handles expense-specific logic
   - `ExpenseNotificationService`: Only handles event creation and dispatch

2. **Open/Closed Principle (OCP)**

   - Base producer is open for extension (subclasses) but closed for modification
   - New event types can be added without changing existing code

3. **Liskov Substitution Principle (LSP)**

   - Any subclass of `NotificationEventProducer` can be used wherever the base class is expected

4. **Interface Segregation Principle (ISP)**

   - Each component exposes only necessary public methods
   - Template method pattern allows selective override

5. **Dependency Inversion Principle (DIP)**
   - Depends on abstractions (KafkaTemplate, ObjectMapper) not concretions

## Components

### 1. Base Producer (`NotificationEventProducer<T>`)

**Location:** `com.jaya.kafka.producer.NotificationEventProducer`

Abstract base class providing core Kafka publishing functionality.

**Key Features:**

- Asynchronous and synchronous sending
- Validation hooks
- Partitioning strategy
- Pre/post send hooks
- Error handling
- Logging

**Template Methods (Must Override):**

```java
protected abstract String getTopicName();
protected abstract String getEventTypeName();
```

**Hook Methods (Optional Override):**

```java
protected void validateEvent(T event)
protected String generatePartitionKey(T event)
protected void beforeSend(T event)
protected void afterSendSuccess(T event, SendResult result)
protected void afterSendFailure(T event, Throwable ex)
```

### 2. Event DTO (`ExpenseNotificationEvent`)

**Location:** `com.jaya.kafka.events.ExpenseNotificationEvent`

Matches the structure expected by Notification Service's `ExpenseEventDTO`.

**Fields:**

- `expenseId`: Integer
- `userId`: Integer
- `action`: String (CREATE, UPDATE, DELETE, APPROVE, REJECT)
- `amount`: Double
- `description`: String
- `category`: String
- `paymentMethod`: String
- `timestamp`: LocalDateTime
- `metadata`: String (JSON for additional data)

### 3. Expense Producer (`ExpenseNotificationProducer`)

**Location:** `com.jaya.kafka.producer.ExpenseNotificationProducer`

Concrete implementation for expense events.

**Features:**

- Validates user ID, action, and timestamp
- Partitions by user ID (maintains event ordering per user)
- Configurable topic from application.yml

### 4. Notification Service (`ExpenseNotificationService`)

**Location:** `com.jaya.kafka.service.ExpenseNotificationService`

High-level service for creating and sending notifications.

**Methods:**

- `sendExpenseCreatedNotification(Expense expense)`
- `sendExpenseUpdatedNotification(Expense expense)`
- `sendExpenseDeletedNotification(Integer expenseId, Integer userId, String description)`
- `sendExpenseApprovedNotification(Expense expense)`
- `sendExpenseRejectedNotification(Expense expense)`

## Configuration

### application.yml

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      properties:
        spring.json.add.type.headers: false

kafka:
  topics:
    expense-events: expense-events
```

## Usage

### In Controller (ExpenseController.java)

```java
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseNotificationService expenseNotificationService;

    @PostMapping("/add-expense")
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        Expense created = expenseService.addExpense(expense);

        // Send notification asynchronously
        expenseNotificationService.sendExpenseCreatedNotification(created);

        return ResponseEntity.ok(created);
    }

    @PutMapping("/edit-expense/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Integer id,
                                                   @RequestBody Expense expense) {
        Expense updated = expenseService.updateExpense(id, expense);

        // Send notification asynchronously
        expenseNotificationService.sendExpenseUpdatedNotification(updated);

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable Integer id) {
        Expense expense = expenseService.getExpenseById(id);
        expenseService.deleteExpense(id);

        // Send notification asynchronously
        expenseNotificationService.sendExpenseDeletedNotification(
            id, expense.getUser().getId(), expense.getExpenseName()
        );

        return ResponseEntity.ok("Deleted");
    }
}
```

## Notification Service Integration

The Notification Service consumes these events from the `expense-events` topic:

```java
@KafkaListener(topics = "expense-events", groupId = "notification-service-group")
public void consumeExpenseEvent(ExpenseEventDTO event) {
    // Process notification based on event.getAction()
    // - CREATE: "New expense created: {description}"
    // - UPDATE: "Expense updated: {description}"
    // - DELETE: "Expense deleted: {description}"
}
```

## Extending for Other Services

### Example: Budget Notification Producer

```java
@Component
public class BudgetNotificationProducer extends NotificationEventProducer<BudgetNotificationEvent> {

    @Value("${kafka.topics.budget-events:budget-events}")
    private String topicName;

    public BudgetNotificationProducer(KafkaTemplate<String, Object> kafkaTemplate,
                                      ObjectMapper objectMapper) {
        super(kafkaTemplate, objectMapper);
    }

    @Override
    protected String getTopicName() {
        return topicName;
    }

    @Override
    protected String getEventTypeName() {
        return "Budget";
    }

    @Override
    protected void validateEvent(BudgetNotificationEvent event) {
        super.validateEvent(event);
        if (event.getBudgetId() == null) {
            throw new IllegalArgumentException("Budget ID cannot be null");
        }
    }

    @Override
    protected String generatePartitionKey(BudgetNotificationEvent event) {
        return "budget-" + event.getBudgetId();
    }
}
```

## Error Handling

**Non-Blocking Design:**

- Notification failures don't break main business logic
- Errors are logged but not propagated
- Asynchronous sending prevents blocking

**Retry Mechanism:**

- Kafka producer configured with `retries: 3`
- Idempotence enabled to prevent duplicates

## Monitoring

**Logging Levels:**

- INFO: Successful sends
- WARN: Metadata serialization failures (non-critical)
- ERROR: Send failures

**Metrics to Monitor:**

- Kafka producer lag
- Failed send count
- Message send rate

## Testing

### Unit Test Example

```java
@Test
void shouldSendExpenseCreatedNotification() {
    Expense expense = createTestExpense();

    expenseNotificationService.sendExpenseCreatedNotification(expense);

    verify(kafkaTemplate).send(
        eq("expense-events"),
        anyString(),
        argThat(event ->
            event.getAction().equals("CREATE") &&
            event.getUserId().equals(expense.getUser().getId())
        )
    );
}
```

## Benefits

1. **Reusability**: Same base class for all notification types
2. **Maintainability**: Changes to Kafka logic happen in one place
3. **Testability**: Easy to mock and test
4. **Scalability**: Async sending doesn't block requests
5. **Reliability**: Built-in retry and error handling
6. **Flexibility**: Hook methods allow customization without modification

## Future Enhancements

1. **Dead Letter Queue**: For failed messages
2. **Message Compression**: For large payloads
3. **Batch Sending**: For bulk operations
4. **Circuit Breaker**: To prevent cascading failures
5. **Custom Serializers**: For optimized payload sizes
