# Kafka Consumer Offset Reset Guide

## Problem

The Notification-Service has been consuming old messages from Kafka topics, which may contain corrupted or incompatible data from before the fixes were applied.

## Solution: Reset Consumer Offsets to Latest

### Option 1: Using Kafka Command Line Tools

#### Reset ALL consumer groups to latest offset:

```bash
# For Windows (PowerShell)
cd C:\kafka_2.13-3.7.1\bin\windows

# Reset notification-expense-group
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-expense-group --reset-offsets --to-latest --topic expense-events --execute

# Reset notification-bill-group
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-bill-group --reset-offsets --to-latest --topic bill-events --execute

# Reset notification-budget-group
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-budget-group --reset-offsets --to-latest --topic budget-events --execute

# Reset notification-category-group
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-category-group --reset-offsets --to-latest --topic category-events --execute

# Reset notification-payment-method-group
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-payment-method-group --reset-offsets --to-latest --topic payment-method-events --execute

# Reset notification-friend-group
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-friend-group --reset-offsets --to-latest --topic friend-events --execute

# Reset notification-friend-request-group
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-friend-request-group --reset-offsets --to-latest --topic friend-request-events --execute
```

### Option 2: Delete Consumer Groups (Clean Slate)

```bash
# For Windows (PowerShell)
cd C:\kafka_2.13-3.7.1\bin\windows

# Delete all notification consumer groups
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-expense-group --delete
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-bill-group --delete
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-budget-group --delete
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-category-group --delete
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-payment-method-group --delete
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-friend-group --delete
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-friend-request-group --delete
```

### Option 3: Temporary Group ID Change (Quick Fix)

Update `application.yaml` to use new consumer group IDs temporarily:

```yaml
spring:
  kafka:
    consumer:
      group-id: notification-service-group-v2 # Changed from notification-service-group
```

This will create new consumer groups that automatically start from the latest offset.

## Verification

### Check current offsets:

```bash
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --group notification-payment-method-group --describe
```

### List all consumer groups:

```bash
.\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --list
```

## After Reset

1. **Start Notification-Service** - It will now consume only new messages
2. **Test by creating new data** - Create a new expense, payment method, etc.
3. **Verify notifications** - Check if notifications are created successfully without errors

## Important Notes

⚠️ **Do NOT reset offsets while the service is running!**

- Stop Notification-Service first
- Reset offsets
- Start Notification-Service again

⚠️ **application.yaml already updated to `auto-offset-reset: latest`**

- New consumer groups will automatically start from latest
- Existing consumer groups need manual reset (use commands above)

## Current Configuration

The `application.yaml` has been updated to:

```yaml
consumer:
  auto-offset-reset: latest # Changed from 'earliest'
```

This ensures that:

- **New consumer groups** → Start from latest messages only
- **Existing consumer groups** → Continue from last committed offset (need manual reset)
