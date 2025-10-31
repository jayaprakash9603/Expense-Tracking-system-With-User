# 📋 Kafka Topics & Event Structure - Quick Reference

## 🎯 Kafka Topics Overview

| Topic Name | Producer Service | Consumer | Event Types |
|------------|------------------|----------|-------------|
| `expense-events` | social-media-app | Notification-Service | CREATE, UPDATE, DELETE, APPROVE, REJECT |
| `bill-events` | Bill-Service | Notification-Service | CREATE, UPDATE, DELETE, PAID, REMINDER, OVERDUE |
| `budget-events` | Budget-Service | Notification-Service | CREATE, UPDATE, DELETE, EXCEEDED, WARNING, LIMIT_APPROACHING |
| `category-events` | Category-Service | Notification-Service | CREATE, UPDATE, DELETE, BUDGET_EXCEEDED |
| `payment-method-events` | Payment-Method-Service | Notification-Service | CREATE, UPDATE, DELETE, VERIFIED |
| `friend-events` | Friendship-Service | Notification-Service | REQUEST_SENT, REQUEST_RECEIVED, REQUEST_ACCEPTED, REQUEST_REJECTED, FRIEND_REMOVED |

---

## 📝 Event Structure Examples

### 1. Expense Event (expense-events)

```json
{
  "expenseId": 123,
  "userId": 1,
  "action": "CREATE",
  "amount": 45.50,
  "description": "Coffee at Starbucks",
  "category": "Food & Dining",
  "paymentMethod": "Credit Card",
  "timestamp": "2024-10-31T10:30:00",
  "metadata": "{\"merchantName\":\"Starbucks\",\"location\":\"Downtown\"}"
}
```

**Action Types:**
- `CREATE` - New expense created
- `UPDATE` - Expense modified
- `DELETE` - Expense deleted
- `APPROVE` - Expense approved
- `REJECT` - Expense rejected

---

### 2. Bill Event (bill-events)

```json
{
  "billId": 456,
  "userId": 1,
  "action": "REMINDER",
  "name": "Electricity Bill",
  "description": "Monthly electricity payment",
  "amount": 125.75,
  "paymentMethod": "Bank Account",
  "type": "UTILITY",
  "category": "Utilities",
  "dueDate": "2024-11-05",
  "timestamp": "2024-10-31T10:30:00",
  "metadata": "{\"provider\":\"City Power\",\"accountNumber\":\"****1234\"}"
}
```

**Action Types:**
- `CREATE` - New bill created
- `UPDATE` - Bill details updated
- `DELETE` - Bill deleted
- `PAID` - Bill marked as paid
- `REMINDER` - Payment reminder
- `OVERDUE` - Bill is overdue

---

### 3. Budget Event (budget-events)

```json
{
  "budgetId": 789,
  "userId": 1,
  "action": "WARNING",
  "budgetName": "Monthly Grocery Budget",
  "amount": 500.00,
  "spentAmount": 425.00,
  "remainingAmount": 75.00,
  "category": "Groceries",
  "period": "MONTHLY",
  "expenseIds": [123, 124, 125],
  "percentageUsed": 85.0,
  "timestamp": "2024-10-31T10:30:00",
  "metadata": "{\"startDate\":\"2024-10-01\",\"endDate\":\"2024-10-31\"}"
}
```

**Action Types:**
- `CREATE` - New budget created
- `UPDATE` - Budget modified
- `DELETE` - Budget deleted
- `EXCEEDED` - Budget limit exceeded
- `WARNING` - Approaching budget limit (80%+)
- `LIMIT_APPROACHING` - Getting close to limit (70%+)

---

### 4. Category Event (category-events)

```json
{
  "categoryId": 10,
  "userId": 1,
  "action": "BUDGET_EXCEEDED",
  "categoryName": "Entertainment",
  "description": "Movies, concerts, streaming",
  "icon": "🎬",
  "color": "#FF5733",
  "budgetLimit": 200.00,
  "totalExpenses": 235.50,
  "timestamp": "2024-10-31T10:30:00",
  "metadata": "{\"expenseCount\":15}"
}
```

**Action Types:**
- `CREATE` - New category created
- `UPDATE` - Category details updated
- `DELETE` - Category deleted
- `BUDGET_EXCEEDED` - Category budget exceeded

---

### 5. Payment Method Event (payment-method-events)

```json
{
  "paymentMethodId": 5,
  "userId": 1,
  "action": "VERIFIED",
  "methodName": "Chase Visa",
  "methodType": "CREDIT_CARD",
  "last4Digits": "4532",
  "provider": "Visa",
  "isDefault": true,
  "isVerified": true,
  "timestamp": "2024-10-31T10:30:00",
  "metadata": "{\"expiryMonth\":12,\"expiryYear\":2026}"
}
```

**Action Types:**
- `CREATE` - New payment method added
- `UPDATE` - Payment method updated
- `DELETE` - Payment method removed
- `VERIFIED` - Payment method verified

---

### 6. Friend Event (friend-events)

```json
{
  "friendshipId": 25,
  "userId": 1,
  "friendId": 2,
  "action": "REQUEST_RECEIVED",
  "friendName": "John Doe",
  "friendEmail": "john.doe@example.com",
  "friendProfileImage": "https://example.com/profiles/john.jpg",
  "timestamp": "2024-10-31T10:30:00",
  "metadata": "{\"mutualFriends\":5}"
}
```

**Action Types:**
- `REQUEST_SENT` - Friend request sent
- `REQUEST_RECEIVED` - Friend request received
- `REQUEST_ACCEPTED` - Friend request accepted
- `REQUEST_REJECTED` - Friend request rejected
- `FRIEND_REMOVED` - Friend removed

---

## 🔧 How to Publish Events (Producer Side)

### Example: Publishing Expense Event

```java
import org.springframework.kafka.core.KafkaTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class ExpenseKafkaProducer {
    
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String TOPIC = "expense-events";
    
    public void publishExpenseCreatedEvent(Expense expense) {
        try {
            ExpenseEventDTO event = ExpenseEventDTO.builder()
                .expenseId(expense.getId())
                .userId(expense.getUserId())
                .action("CREATE")
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .paymentMethod(expense.getPaymentMethod())
                .timestamp(LocalDateTime.now())
                .metadata(buildMetadata(expense))
                .build();
            
            String eventJson = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, String.valueOf(expense.getId()), eventJson);
            
            log.info("Published expense event: {}", eventJson);
        } catch (Exception e) {
            log.error("Error publishing expense event: {}", e.getMessage(), e);
        }
    }
    
    private String buildMetadata(Expense expense) throws JsonProcessingException {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("merchantName", expense.getMerchantName());
        metadata.put("location", expense.getLocation());
        metadata.put("receiptUrl", expense.getReceiptUrl());
        return objectMapper.writeValueAsString(metadata);
    }
}
```

### Example: Publishing Bill Event

```java
@Service
@RequiredArgsConstructor
public class BillKafkaProducer {
    
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String TOPIC = "bill-events";
    
    public void publishBillReminderEvent(Bill bill) {
        try {
            BillEventDTO event = BillEventDTO.builder()
                .billId(bill.getId())
                .userId(bill.getUserId())
                .action("REMINDER")
                .name(bill.getName())
                .description(bill.getDescription())
                .amount(bill.getAmount())
                .paymentMethod(bill.getPaymentMethod())
                .type(bill.getType())
                .category(bill.getCategory())
                .dueDate(bill.getDate())
                .timestamp(LocalDateTime.now())
                .metadata(buildMetadata(bill))
                .build();
            
            String eventJson = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, String.valueOf(bill.getId()), eventJson);
            
            log.info("Published bill reminder event: {}", eventJson);
        } catch (Exception e) {
            log.error("Error publishing bill event: {}", e.getMessage(), e);
        }
    }
}
```

### Example: Publishing Budget Event

```java
@Service
@RequiredArgsConstructor
public class BudgetKafkaProducer {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    private static final String TOPIC = "budget-events";
    
    public void publishBudgetExceededEvent(Budget budget, Double spentAmount) {
        try {
            BudgetEventDTO event = BudgetEventDTO.builder()
                .budgetId(budget.getId())
                .userId(budget.getUserId())
                .action("EXCEEDED")
                .budgetName(budget.getName())
                .amount(budget.getAmount())
                .spentAmount(spentAmount)
                .remainingAmount(0.0)  // Exceeded, so negative or zero
                .category(budget.getCategory())
                .period(budget.getPeriod())
                .expenseIds(budget.getExpenseIds())
                .percentageUsed((spentAmount / budget.getAmount()) * 100)
                .timestamp(LocalDateTime.now())
                .build();
            
            kafkaTemplate.send(TOPIC, String.valueOf(budget.getId()), event);
            
            log.info("Published budget exceeded event for budget: {}", budget.getId());
        } catch (Exception e) {
            log.error("Error publishing budget event: {}", e.getMessage(), e);
        }
    }
}
```

---

## 📥 Consuming Events (Notification Service)

The Notification Service automatically consumes all events via `NotificationEventConsumer`:

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationEventConsumer {
    
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    
    @KafkaListener(
        topics = "expense-events",
        groupId = "notification-expense-group",
        containerFactory = "expenseEventKafkaListenerContainerFactory"
    )
    public void consumeExpenseEvent(String eventJson) {
        try {
            ExpenseEventDTO event = objectMapper.readValue(eventJson, ExpenseEventDTO.class);
            Notification notification = createNotificationFromExpenseEvent(event);
            Notification saved = notificationService.createNotification(notification);
            sendNotificationToUser(saved);
        } catch (Exception e) {
            log.error("Error processing expense event: {}", e.getMessage(), e);
        }
    }
    
    // ... similar methods for other event types
}
```

---

## 🎯 Notification Mapping

### Expense Events → Notifications

| Action | NotificationType | Priority | Title |
|--------|-----------------|----------|-------|
| CREATE | EXPENSE_ADDED | LOW | "Expense Added Successfully" |
| UPDATE | EXPENSE_UPDATED | LOW | "Expense Updated" |
| DELETE | EXPENSE_DELETED | LOW | "Expense Deleted" |
| APPROVE | EXPENSE_APPROVED | MEDIUM | "Expense Approved" |
| REJECT | EXPENSE_REJECTED | HIGH | "Expense Rejected" |

### Bill Events → Notifications

| Action | NotificationType | Priority | Title |
|--------|-----------------|----------|-------|
| CREATE | BILL_CREATED | MEDIUM | "New Bill Created" |
| PAID | BILL_PAID | HIGH | "Bill Paid Successfully" |
| REMINDER | BILL_DUE_REMINDER | HIGH | "Bill Payment Reminder" |
| OVERDUE | BILL_OVERDUE | CRITICAL | "Bill Overdue!" |

### Budget Events → Notifications

| Action | NotificationType | Priority | Title |
|--------|-----------------|----------|-------|
| EXCEEDED | BUDGET_EXCEEDED | CRITICAL | "Budget Exceeded!" |
| WARNING | BUDGET_WARNING | HIGH | "Budget Alert" |
| LIMIT_APPROACHING | BUDGET_LIMIT_APPROACHING | MEDIUM | "Budget Limit Approaching" |

### Friend Events → Notifications

| Action | NotificationType | Priority | Title |
|--------|-----------------|----------|-------|
| REQUEST_RECEIVED | FRIEND_REQUEST_RECEIVED | MEDIUM | "New Friend Request" |
| REQUEST_ACCEPTED | FRIEND_REQUEST_ACCEPTED | HIGH | "Friend Request Accepted" |

---

## 🔍 Testing Kafka Events

### 1. Start Kafka
```bash
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka
bin/kafka-server-start.sh config/server.properties
```

### 2. Create Topics
```bash
# Create all required topics
kafka-topics.sh --create --topic expense-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics.sh --create --topic bill-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics.sh --create --topic budget-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics.sh --create --topic category-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics.sh --create --topic payment-method-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics.sh --create --topic friend-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
```

### 3. Test Event Publishing
```bash
# Publish test expense event
kafka-console-producer.sh --topic expense-events --bootstrap-server localhost:9092
> {"expenseId":123,"userId":1,"action":"CREATE","amount":45.50,"description":"Coffee","category":"Food","timestamp":"2024-10-31T10:30:00"}
```

### 4. Monitor Event Consumption
```bash
# Check Notification Service logs
tail -f logs/notification-service.log

# Look for:
# "Received expense event: ..."
# "Expense notification created and sent: ..."
# "Notification sent via WebSocket to user ..."
```

---

## 📊 Kafka Consumer Groups

| Group ID | Topics | Purpose |
|----------|--------|---------|
| `notification-expense-group` | expense-events | Consume expense events |
| `notification-bill-group` | bill-events | Consume bill events |
| `notification-budget-group` | budget-events | Consume budget events |
| `notification-category-group` | category-events | Consume category events |
| `notification-payment-method-group` | payment-method-events | Consume payment events |
| `notification-friend-group` | friend-events | Consume friend events |

---

## ✅ Integration Checklist

### For Each Service (Expense, Bill, Budget, etc.)

- [ ] Add `spring-kafka` dependency to pom.xml
- [ ] Create KafkaProducer service class
- [ ] Define Kafka topic constant
- [ ] Create event DTO matching Notification Service expectations
- [ ] Publish event after CREATE operation
- [ ] Publish event after UPDATE operation
- [ ] Publish event after DELETE operation
- [ ] Publish event for special actions (APPROVE, PAID, EXCEEDED, etc.)
- [ ] Add error handling and logging
- [ ] Test event publishing
- [ ] Verify Notification Service receives events
- [ ] Verify notifications appear in frontend

---

## 🚀 Quick Start for Other Services

### Step 1: Add Dependency (pom.xml)
```xml
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>
```

### Step 2: Configure Kafka (application.yaml)
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
```

### Step 3: Create Producer
```java
@Service
@RequiredArgsConstructor
public class EventKafkaProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String TOPIC = "your-topic-name";
    
    public void publishEvent(YourEventDTO event) {
        kafkaTemplate.send(TOPIC, event);
    }
}
```

### Step 4: Publish Events in Service Layer
```java
@Service
@RequiredArgsConstructor
public class YourService {
    private final EventKafkaProducer kafkaProducer;
    
    public YourEntity create(YourDTO dto) {
        // Save entity
        YourEntity entity = repository.save(dto);
        
        // Publish event
        YourEventDTO event = buildEvent(entity, "CREATE");
        kafkaProducer.publishEvent(event);
        
        return entity;
    }
}
```

---

**Status**: ✅ Ready for Integration  
**Kafka Bootstrap Server**: localhost:9092  
**Notification Service Port**: 6003
