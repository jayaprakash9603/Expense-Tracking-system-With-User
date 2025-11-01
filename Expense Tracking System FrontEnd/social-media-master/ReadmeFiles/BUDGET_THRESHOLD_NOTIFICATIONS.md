# Budget Threshold Notifications Implementation

## Overview

Implemented automatic budget threshold notifications in the Budget Service that trigger when budget usage reaches 50%, 80%, or exceeds 100%. These notifications are sent automatically from the service layer whenever budget state changes.

## Notification Types

### 1. Budget Exceeded (CRITICAL)

- **Trigger**: When budget usage >= 100%
- **Priority**: CRITICAL
- **Action**: `EXCEEDED`
- **Use Case**: Budget limit has been surpassed

### 2. Budget Warning (HIGH)

- **Trigger**: When budget usage >= 80%
- **Priority**: HIGH
- **Action**: `WARNING`
- **Use Case**: Approaching budget limit, 80% or more spent

### 3. Budget Limit Approaching (MEDIUM)

- **Trigger**: When budget usage >= 50%
- **Priority**: MEDIUM
- **Action**: `LIMIT_APPROACHING`
- **Use Case**: Early warning, halfway to budget limit

## Implementation Details

### Service Layer Changes

**File**: `BudgetServiceImpl.java`

#### 1. Dependency Injection

```java
@Autowired
private BudgetNotificationService budgetNotificationService;
```

#### 2. Helper Method: Calculate Total Expense Amount

```java
private BigDecimal calculateTotalExpenseAmount(Budget budget, Integer userId)
```

- Iterates through all expense IDs in the budget
- Fetches each expense from ExpenseService
- Only counts "loss" type expenses with "cash" or "creditNeedToPaid" payment methods
- Returns total as BigDecimal
- Handles errors gracefully (logs and continues)

#### 3. Core Method: Check and Send Threshold Notifications

```java
private void checkAndSendThresholdNotifications(Budget budget, Integer userId)
```

- Calculates total spent using `calculateTotalExpenseAmount()`
- Calculates percentage used: `(spent / budget.amount) * 100`
- Checks thresholds in priority order:
  - `>= 100%` → `sendBudgetExceededNotification()`
  - `>= 80%` → `sendBudgetWarningNotification()`
  - `>= 50%` → `sendBudgetLimitApproachingNotification()`
- Errors are logged but don't fail the operation

### Automatic Trigger Points

The `checkAndSendThresholdNotifications()` method is automatically called after:

#### 1. Creating a Budget with Expenses

**Method**: `createBudget(Budget budget, Integer userId)`

```java
if (!validExpenseIds.isEmpty()) {
    checkAndSendThresholdNotifications(savedBudget, userId);
}
```

- Only checks if budget has expenses
- Triggers after expenses are associated

#### 2. Editing a Budget

**Method**: `editBudget(Integer budgetId, Budget budget, Integer userId)`

```java
Budget savedBudget = budgetRepository.save(existingBudget);
checkAndSendThresholdNotifications(savedBudget, userId);
return savedBudget;
```

- Triggers after budget is saved with new amount or expenses
- Handles changes to budget amount, dates, or expense associations

#### 3. Adding Expense to Budget

**Method**: `editBudgetWithExpenseId(Set<Integer> budgetIds, Integer expenseId, Integer userId)`

```java
Budget savedBudget = budgetRepository.save(budget);
updatedBudgets.add(savedBudget);
checkAndSendThresholdNotifications(savedBudget, userId);
```

- Triggers for each budget updated
- Called when expense is linked to budget(s)

## Design Principles Applied

### SOLID Principles

1. **Single Responsibility Principle (SRP)**

   - `calculateTotalExpenseAmount()`: Only calculates expenses
   - `checkAndSendThresholdNotifications()`: Only checks thresholds and sends notifications
   - Each method has one clear purpose

2. **Open/Closed Principle (OCP)**

   - Methods are open for extension (can add more threshold levels)
   - Closed for modification (existing logic doesn't need changes)

3. **Dependency Inversion Principle (DIP)**
   - Depends on `BudgetNotificationService` abstraction
   - Doesn't directly interact with Kafka

### DRY Principle

- `calculateTotalExpenseAmount()` is reusable across all budget operations
- `checkAndSendThresholdNotifications()` centralizes threshold logic
- Avoids code duplication in controller or multiple service methods

## Notification Flow

```
1. User performs budget operation (create/update/add expense)
   ↓
2. BudgetServiceImpl performs business logic
   ↓
3. Budget is saved to database
   ↓
4. checkAndSendThresholdNotifications() is called
   ↓
5. calculateTotalExpenseAmount() sums all expenses
   ↓
6. Percentage is calculated
   ↓
7. Appropriate notification method is called (if threshold met)
   ↓
8. BudgetNotificationService creates BudgetNotificationEvent
   ↓
9. BudgetNotificationProducer sends event to Kafka
   ↓
10. Notification Service consumes event and creates notification
   ↓
11. Frontend displays notification to user
```

## Expense Calculation Logic

Only expenses matching these criteria are counted:

- **Type**: `"loss"` (ignoring income/profits)
- **Payment Methods**:
  - `"cash"` (immediate out-of-pocket)
  - `"creditNeedToPaid"` (credit card or debt that needs to be paid)

This ensures accurate budget tracking by only counting actual spending.

## Error Handling

### Graceful Degradation

- If expense fetching fails, it's logged and calculation continues
- If threshold checking fails, error is logged but budget operation succeeds
- Notifications are asynchronous and don't block budget operations

### Logging

```java
System.err.println("Error fetching expense " + expenseId + ": " + e.getMessage());
System.err.println("Error checking budget thresholds for budget " + budget.getId() + ": " + e.getMessage());
```

## Testing Scenarios

### Scenario 1: Budget Approaching Limit (50%)

1. Create budget with amount: $1000
2. Add expenses totaling $500
3. **Expected**: LIMIT_APPROACHING notification sent

### Scenario 2: Budget Warning (80%)

1. Create budget with amount: $1000
2. Add expenses totaling $850
3. **Expected**: WARNING notification sent

### Scenario 3: Budget Exceeded (100%+)

1. Create budget with amount: $1000
2. Add expenses totaling $1100
3. **Expected**: EXCEEDED notification sent

### Scenario 4: Threshold Progression

1. Create budget: $1000
2. Add expense: $400 → No notification
3. Add expense: $200 (total $600) → LIMIT_APPROACHING
4. Add expense: $300 (total $900) → WARNING
5. Add expense: $200 (total $1100) → EXCEEDED

### Scenario 5: Budget Amount Change

1. Create budget: $1000 with $700 expenses → WARNING
2. Edit budget amount to $500 → EXCEEDED (now over 100%)
3. Edit budget amount to $2000 → No notification (now under 50%)

## Integration with Existing System

### Kafka Configuration

- **Topic**: `budget-events`
- **Bootstrap Servers**: `localhost:9092`
- **Serializer**: `JsonSerializer`
- **Partitioning**: By `userId`

### Notification Service

- Already configured to handle 6 budget action types
- `BudgetEventDTO` includes all required fields
- Notification preferences control user's subscription to alerts

### Frontend

- `notificationConfig.js` has configuration for all 6 budget notification types
- Notifications appear in notification center with appropriate priority colors
- Icons and messages are pre-configured

## Benefits

1. **Proactive Alerts**: Users are warned before exceeding budget
2. **Automatic**: No manual checking required
3. **Real-time**: Notifications sent immediately when threshold is crossed
4. **Service-Layer Logic**: Business logic in the right place, not controller
5. **Maintainable**: Clear separation of concerns, easy to test
6. **Extensible**: Easy to add more threshold levels or notification types

## Files Modified

### Budget Service

1. **BudgetServiceImpl.java**
   - Added `@Autowired BudgetNotificationService`
   - Added `calculateTotalExpenseAmount()` helper method
   - Added `checkAndSendThresholdNotifications()` method
   - Updated `createBudget()` to check thresholds
   - Updated `editBudget()` to check thresholds
   - Updated `editBudgetWithExpenseId()` to check thresholds

## Future Enhancements

1. **State Tracking**: Avoid duplicate notifications for same threshold

   - Store last notification type sent in budget entity
   - Only send notification if threshold increases

2. **Configurable Thresholds**: Allow users to set custom threshold percentages

   - Add user preferences for 50%, 80%, 100% customization

3. **Summary Notifications**: Daily/weekly budget summary emails

   - Aggregate all budgets and their status
   - Send scheduled digests

4. **Budget Reset**: Automatic notifications when budget period starts/ends
   - Send reminder at start of budget period
   - Send summary at end of budget period

## Conclusion

The budget threshold notification system is now fully integrated into the Budget Service, providing automatic, intelligent alerts based on budget usage. The implementation follows SOLID and DRY principles, is maintainable, and provides a solid foundation for future enhancements.
