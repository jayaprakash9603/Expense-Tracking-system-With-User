# Payment Method Event Fix

## Problem
The Notification-Service was failing to consume payment method events from Payment-method-Service with the error:
```
Unrecognized field "expenseId" (class com.jaya.dto.events.PaymentMethodEventDTO), 
not marked as ignorable
```

## Root Cause
The `PaymentMethodEventDTO` in Notification-Service did not match the actual `PaymentMethodEvent` structure being published by Payment-method-Service.

### Payment-method-Service Event Structure
```java
public class PaymentMethodEvent {
    private Integer userId;
    private Integer expenseId;
    private String paymentMethodName;
    private String paymentType;        // income, expense
    private String description;
    private String icon;
    private String color;
    private String eventType;          // CREATE, UPDATE, DELETE
}
```

### Previous Notification-Service DTO (INCORRECT)
```java
public class PaymentMethodEventDTO {
    private Integer paymentMethodId;   // ❌ Not in source event
    private Integer userId;
    private String action;             // ❌ Called "eventType" in source
    private String methodName;         // ❌ Called "paymentMethodName" in source
    private String methodType;         // ❌ Called "paymentType" in source
    private String last4Digits;        // ❌ Not in source event
    private String provider;           // ❌ Not in source event
    private Boolean isDefault;         // ❌ Not in source event
    private Boolean isVerified;        // ❌ Not in source event
    private LocalDateTime timestamp;   // ❌ Not in source event
    private String metadata;
}
```

## Solution

### 1. Updated PaymentMethodEventDTO
**File:** `Notification-Service/src/main/java/com/jaya/dto/events/PaymentMethodEventDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)  // Added for safety
public class PaymentMethodEventDTO implements Serializable {
    private Integer userId;
    private Integer expenseId;              // ✅ Matches source
    private String paymentMethodName;       // ✅ Matches source
    private String paymentType;             // ✅ Matches source (income/expense)
    private String description;
    private String icon;
    private String color;
    private String eventType;               // ✅ Matches source (CREATE/UPDATE/DELETE)
}
```

### 2. Updated Consumer Method
**File:** `Notification-Service/src/main/java/com/jaya/consumer/NotificationEventConsumer.java`

Updated `createNotificationFromPaymentMethodEvent()` to use correct field names:

```java
private Notification createNotificationFromPaymentMethodEvent(PaymentMethodEventDTO event) {
    // ... setup code ...
    
    String eventType = event.getEventType();  // Changed from getAction()
    
    switch (eventType) {
        case "CREATE":
            notification.setType(NotificationType.PAYMENT_METHOD_ADDED);
            notification.setMessage(String.format(
                "New payment method '%s' has been added for %s", 
                event.getPaymentMethodName(),  // Changed from getMethodName()
                event.getPaymentType()));       // Changed from getMethodType()
            break;
        // ... other cases ...
    }
    
    // Updated metadata to use available fields
    String metadata = String.format(
        "{\"paymentMethodName\":\"%s\",\"paymentType\":\"%s\",\"expenseId\":%d,\"description\":\"%s\"}", 
        event.getPaymentMethodName(), 
        event.getPaymentType(),
        event.getExpenseId(),
        event.getDescription());
    notification.setMetadata(metadata);
    
    return notification;
}
```

## Key Changes

1. **Field Name Alignment:**
   - `action` → `eventType`
   - `methodName` → `paymentMethodName`
   - `methodType` → `paymentType`
   - Added `expenseId`, `description`, `icon`, `color`
   - Removed fields not in source: `paymentMethodId`, `last4Digits`, `provider`, `isDefault`, `isVerified`, `timestamp`

2. **Added @JsonIgnoreProperties(ignoreUnknown = true):**
   - Provides resilience if source adds new fields
   - Prevents deserialization errors for unknown fields

3. **Updated Notification Messages:**
   - Now uses correct field names from the event
   - Metadata includes relevant fields from the actual event structure

## Testing

After applying this fix:

1. **Restart Notification-Service:**
   ```bash
   cd Notification-Service
   mvn spring-boot:run
   ```

2. **Create a test payment method** to trigger an event

3. **Verify in logs:**
   ```
   ✅ Received payment method event: ConsumerRecord(...)
   ✅ Payment method notification created and sent: [notificationId]
   ```

4. **Check for errors:**
   - No more "Unrecognized field" errors
   - Successful notification creation
   - WebSocket delivery to user

## Important Notes

⚠️ **Cross-Service DTO Alignment:**
- When services communicate via Kafka, DTOs MUST match exactly
- Always check the source service's event structure
- Use `@JsonIgnoreProperties(ignoreUnknown = true)` for forward compatibility

⚠️ **Event-Driven Architecture Best Practices:**
1. Document event schemas in a shared location
2. Version event structures when making breaking changes
3. Use schema registry (like Confluent Schema Registry) for production
4. Add integration tests that verify event consumption

## Related Files

- `Payment-method-Service/src/main/java/com/jaya/dto/PaymentMethodEvent.java` - Source event definition
- `Notification-Service/src/main/java/com/jaya/dto/events/PaymentMethodEventDTO.java` - Consumer DTO (UPDATED)
- `Notification-Service/src/main/java/com/jaya/consumer/NotificationEventConsumer.java` - Consumer logic (UPDATED)

## Status
✅ **FIXED** - Payment method events now consume successfully without deserialization errors.
