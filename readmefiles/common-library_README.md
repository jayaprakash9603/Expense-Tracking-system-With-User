# Expense Tracking System - Common Library

A shared library providing common error handling, Kafka events, and utility classes for all microservices in the Expense Tracking System.

## Features

- **Unified Error Handling**: Consistent error response format across all services
- **Common Exception Classes**: Pre-built exceptions for common scenarios
- **Global Exception Handler**: Auto-configured handler that catches and formats all exceptions
- **Kafka Events**: Standardized event DTOs for inter-service communication
- **Kafka Producers**: Ready-to-use producers with Template Method pattern
- **Utility Classes**: Common utilities for date/time, strings, and request context

## Installation

### Step 1: Build the Library

```bash
cd common-library
mvn clean install
```

### Step 2: Add Dependency to Your Service

Add to your service's `pom.xml`:

```xml
<dependency>
    <groupId>com.jaya.common</groupId>
    <artifactId>expense-common-library</artifactId>
    <version>1.0.0</version>
</dependency>
```

That's it! The library auto-configures itself.

## Usage Guide

### Common DTOs

#### Response Wrappers

```java
import com.jaya.common.dto.response.ApiResponse;
import com.jaya.common.dto.response.PageResponse;

// Success response
return ResponseEntity.ok(ApiResponse.success(data, "Retrieved successfully"));

// Created response (201)
return ResponseEntity.status(201).body(ApiResponse.created(data, "Created successfully"));

// No content response (204)
return ResponseEntity.ok(ApiResponse.noContent("Deleted successfully"));

// Error response
return ResponseEntity.badRequest().body(ApiResponse.badRequest("Invalid input"));

// Paginated response from Spring Page
Page<Expense> expensePage = expenseRepository.findByUserId(userId, pageable);
return ResponseEntity.ok(PageResponse.of(expensePage));
```

#### Domain DTOs

```java
import com.jaya.common.dto.*;

// User DTO
UserDTO user = UserDTO.basic(1, "user@example.com", "John", "Doe");

// Expense DTO
ExpenseDTO expense = ExpenseDTO.basic(1, userId, categoryId, 150.00);

// Budget DTO with status checking
BudgetDTO budget = BudgetDTO.basic(1, "Monthly Budget", 1000.0, userId);
budget.setSpentAmount(850.0);
System.out.println(budget.getStatusString()); // "WARNING"

// Category DTO
CategoryDTO category = CategoryDTO.basic(1, "Food", CategoryDTO.TYPE_EXPENSE, "🍔", "#FF5733");

// Bill DTO
BillDTO bill = BillDTO.basic(1, "Electric Bill", 150.00, LocalDate.now().plusDays(7), userId);

// Payment Method DTO
PaymentMethodDTO payment = PaymentMethodDTO.basic(1, "Cash", PaymentMethodDTO.TYPE_CASH, "💵", "#4CAF50");
```

#### Request/Response DTOs

```java
import com.jaya.common.dto.request.*;
import com.jaya.common.dto.response.*;

// Pagination request
PageRequest pageRequest = PageRequest.of(0, 20, "createdAt", "DESC");
org.springframework.data.domain.PageRequest springPageable = pageRequest.toSpringPageRequest();

// Search request
SearchRequest search = SearchRequest.textSearch("groceries");
search.setFilters(Map.of("categoryId", 1, "status", "ACTIVE"));

// Bulk operations
BulkOperationRequest bulkDelete = BulkOperationRequest.delete(List.of(1, 2, 3));
BulkOperationResponse response = BulkOperationResponse.allSuccess(3, "Deleted successfully");
```

### Error Handling

#### ErrorCode Enum

All error codes are centralized in `ErrorCode` enum:

```java
import com.jaya.common.error.ErrorCode;

// Use predefined error codes
throw new ResourceNotFoundException(
    ErrorCode.USER_NOT_FOUND,
    "User not found with ID: " + userId
);
```

#### Exception Classes

| Exception                   | HTTP Status | Use Case                    |
| --------------------------- | ----------- | --------------------------- |
| `ResourceNotFoundException` | 404         | Resource doesn't exist      |
| `AccessDeniedException`     | 403         | User lacks permission       |
| `AuthenticationException`   | 401         | Invalid/expired credentials |
| `ValidationException`       | 400         | Input validation failures   |
| `ConflictException`         | 409         | Duplicates, state conflicts |
| `BusinessException`         | 400         | Domain-specific errors      |
| `KafkaException`            | 500         | Kafka-related failures      |
| `SystemException`           | 500         | Infrastructure errors       |

#### Using Exceptions with Factory Methods

```java
// Resource not found
throw ResourceNotFoundException.forUser(userId);
throw ResourceNotFoundException.forExpense(expenseId);
throw ResourceNotFoundException.forBudget(budgetId);

// Authentication
throw AuthenticationException.invalidToken("Token is malformed");
throw AuthenticationException.expiredToken();
throw AuthenticationException.missingToken();

// Conflict
throw ConflictException.duplicateEmail(email);
throw ConflictException.alreadyFriends(userId, friendId);

// Business logic
throw new BusinessException(ErrorCode.BUDGET_EXCEEDED, "Budget limit reached");
```

#### API Error Response Format

All exceptions return this consistent format:

```json
{
  "errorCode": "USER_NOT_FOUND",
  "message": "User not found with ID: 123",
  "status": 404,
  "path": "/api/users/123",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "traceId": "abc-123-def",
  "serviceName": "USER-SERVICE",
  "details": {},
  "fieldErrors": []
}
```

### Kafka Events

#### UnifiedActivityEvent

For activity tracking and notifications:

```java
@Autowired
private UnifiedActivityEventProducer activityProducer;

public void createExpense(Expense expense, User user) {
    // ... save expense ...

    UnifiedActivityEvent event = UnifiedActivityEvent.builder()
        .eventId(UUID.randomUUID().toString())
        .timestamp(LocalDateTime.now())
        .actorId(user.getId())
        .actorType("USER")
        .actorName(user.getFullName())
        .entityId(expense.getId())
        .entityType(UnifiedActivityEvent.ENTITY_EXPENSE)
        .action(UnifiedActivityEvent.ACTION_CREATED)
        .eventTitle("New Expense Created")
        .eventDescription("Created expense: " + expense.getDescription())
        .payloadJson(objectMapper.writeValueAsString(expense))
        .broadcastToFriends(true)
        .sendNotification(true)
        .createAudit(true)
        .build();

    activityProducer.sendEvent(event);
}
```

#### AuditEvent

For audit logging:

```java
@Autowired
private AuditEventProducer auditProducer;

public void auditUserAction(Long userId, String action) {
    AuditEvent event = AuditEvent.builder()
        .eventId(UUID.randomUUID().toString())
        .timestamp(LocalDateTime.now())
        .serviceName("USER-SERVICE")
        .userId(userId)
        .action(action)
        .entityType("USER")
        .entityId(userId)
        .severity(AuditEvent.SEVERITY_INFO)
        .ipAddress(RequestContextUtil.getClientIp())
        .build();

    auditProducer.sendEvent(event);
}
```

#### FriendRequestEvent

For friend request notifications:

```java
@Autowired
private FriendRequestEventProducer friendRequestProducer;

public void sendFriendRequest(Long senderId, Long receiverId) {
    // ... save friend request ...

    FriendRequestEvent event = FriendRequestEvent.builder()
        .eventId(UUID.randomUUID().toString())
        .timestamp(LocalDateTime.now())
        .senderId(senderId)
        .receiverId(receiverId)
        .status(FriendRequestEvent.STATUS_PENDING)
        .build();

    friendRequestProducer.sendEvent(event);
}
```

### Utility Classes

#### CommonConstants

```java
import com.jaya.common.util.CommonConstants.*;

// Kafka topics
String topic = KafkaTopics.UNIFIED_ACTIVITY_EVENTS;

// Headers
String authHeader = Headers.AUTHORIZATION;

// Date formats
String format = DateFormats.ISO_DATE_TIME;

// Pagination defaults
int pageSize = Pagination.DEFAULT_PAGE_SIZE;
```

#### DateTimeUtil

```java
import com.jaya.common.util.DateTimeUtil;

// Format dates
String formatted = DateTimeUtil.formatDateTime(LocalDateTime.now());
String dateOnly = DateTimeUtil.formatDate(LocalDate.now());

// Parse dates
LocalDateTime dateTime = DateTimeUtil.parseDateTime("2025-01-15T10:30:00");

// Calculations
LocalDateTime startOfDay = DateTimeUtil.getStartOfDay(LocalDate.now());
LocalDateTime endOfMonth = DateTimeUtil.getEndOfMonth(LocalDate.now());

// Relative time
String relative = DateTimeUtil.getRelativeTime(pastDateTime);
// "2 hours ago", "3 days ago", etc.
```

#### StringUtil

```java
import com.jaya.common.util.StringUtil;

// Validation
boolean validEmail = StringUtil.isValidEmail("user@example.com");
boolean validPhone = StringUtil.isValidPhoneNumber("+1234567890");

// Transformation
String capitalized = StringUtil.capitalizeWords("john doe"); // "John Doe"
String slug = StringUtil.toSlug("My Budget 2025"); // "my-budget-2025"

// Masking
String maskedEmail = StringUtil.maskEmail("john@example.com"); // "jo***@example.com"
String maskedCard = StringUtil.maskCreditCard("1234567890123456"); // "************3456"

// Generation
String code = StringUtil.generateRandomCode(6); // "A3B5C7"
String numericCode = StringUtil.generateNumericCode(4); // "1234"
```

#### RequestContextUtil

```java
import com.jaya.common.util.RequestContextUtil;

// In a controller or service with access to HttpServletRequest
String clientIp = RequestContextUtil.getClientIp();
String userAgent = RequestContextUtil.getUserAgent();
String correlationId = RequestContextUtil.getCorrelationId();
String bearerToken = RequestContextUtil.getBearerToken();
```

## Configuration

### Disable Auto-Configuration

In your `application.yml`:

```yaml
# Disable exception handler (use your own)
common:
  exception-handler:
    enabled: false

# Disable Kafka producers
common:
  kafka:
    enabled: false
```

### Override Kafka Topics

```yaml
kafka:
  topics:
    unified-activity-events: my-custom-topic
    audit-events: my-audit-topic
```

## Migration Guide

### Migrating from Existing Exception Handlers

1. **Remove your service's GlobalExceptionHandler**
2. **Replace custom exceptions with common-library exceptions**

Before:

```java
// Old code in your service
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(...) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", ex.getMessage());
        // ...
    }
}
```

After:

```java
// Just throw the common-library exception
throw ResourceNotFoundException.forUser(userId);
// GlobalExceptionHandler from common-library handles the rest
```

### Migrating Kafka Events

1. **Remove duplicate event classes from your service**
2. **Import from common-library**

Before:

```java
// Old code - duplicate class in your service
package com.example.expense.events;

public class UnifiedActivityEvent {
    // ... duplicated code
}
```

After:

```java
// Import from common-library
import com.jaya.common.kafka.events.UnifiedActivityEvent;
import com.jaya.common.kafka.producer.UnifiedActivityEventProducer;

@Autowired
private UnifiedActivityEventProducer producer;
```

## Package Structure

```
com.jaya.common
├── config/
│   └── CommonLibraryAutoConfiguration.java
├── dto/
│   ├── UserDTO.java
│   ├── ExpenseDTO.java
│   ├── BudgetDTO.java
│   ├── CategoryDTO.java
│   ├── BillDTO.java
│   ├── PaymentMethodDTO.java
│   ├── FriendshipDTO.java
│   ├── NotificationDTO.java
│   ├── AuditLogDTO.java
│   ├── ActivityDTO.java
│   ├── request/
│   │   ├── PageRequest.java
│   │   ├── SearchRequest.java
│   │   └── BulkOperationRequest.java
│   └── response/
│       ├── ApiResponse.java
│       ├── PageResponse.java
│       └── BulkOperationResponse.java
├── error/
│   ├── ApiError.java
│   └── ErrorCode.java
├── exception/
│   ├── BaseException.java
│   ├── ResourceNotFoundException.java
│   ├── AccessDeniedException.java
│   ├── AuthenticationException.java
│   ├── ValidationException.java
│   ├── ConflictException.java
│   ├── BusinessException.java
│   ├── KafkaException.java
│   ├── SystemException.java
│   └── handler/
│       └── GlobalExceptionHandler.java
├── kafka/
│   ├── events/
│   │   ├── UnifiedActivityEvent.java
│   │   ├── AuditEvent.java
│   │   ├── NotificationEvent.java
│   │   ├── FriendRequestEvent.java
│   │   └── FriendActivityEvent.java
│   └── producer/
│       ├── NotificationEventProducer.java (abstract)
│       ├── UnifiedActivityEventProducer.java
│       ├── AuditEventProducer.java
│       ├── FriendRequestEventProducer.java
│       └── FriendActivityEventProducer.java
└── util/
    ├── CommonConstants.java
    ├── DateTimeUtil.java
    ├── RequestContextUtil.java
    └── StringUtil.java
```

## Best Practices

1. **Always use ErrorCode enum** - Don't create string error codes
2. **Use factory methods** - Prefer `ResourceNotFoundException.forUser(id)` over constructors
3. **Include context** - Add details to exceptions for debugging
4. **Let exceptions bubble up** - Don't catch and re-throw unless adding context
5. **Use appropriate exception types** - Match the semantic meaning

## Support

For issues or feature requests, contact the platform team.
