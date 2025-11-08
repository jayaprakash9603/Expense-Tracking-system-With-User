// package com.jaya.service;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jaya.dto.events.*;
// import com.jaya.service.processor.*;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.apache.kafka.clients.consumer.ConsumerRecord;
// import org.springframework.kafka.annotation.KafkaListener;
// import org.springframework.stereotype.Service;

// import java.util.Map;

// /**
//  * Main Kafka consumer for notification events
//  * Follows Open/Closed Principle - new event types just need new processors, no
//  * modification here
//  * Follows Dependency Inversion - depends on NotificationEventProcessor
//  * abstraction
//  */
// @Service
// @RequiredArgsConstructor
// @Slf4j
// public class NotificationEventConsumer {

//     private final ExpenseEventProcessor expenseEventProcessor;
//     private final BudgetEventProcessor budgetEventProcessor;
//     private final BillEventProcessor billEventProcessor;
//     private final PaymentMethodEventProcessor paymentMethodEventProcessor;
//     private final FriendEventProcessor friendEventProcessor;
//     private final ObjectMapper objectMapper;

//     /**
//      * Converts payload (LinkedHashMap or ConsumerRecord) to DTO
//      */
//     private <T> T convertToDto(Object payload, Class<T> dtoClass) {
//         try {
//             // If it's a ConsumerRecord, extract the value
//             if (payload instanceof ConsumerRecord) {
//                 ConsumerRecord<?, ?> record = (ConsumerRecord<?, ?>) payload;
//                 payload = record.value();
//                 log.debug("Extracted value from ConsumerRecord");
//             }

//             // Convert Map to DTO
//             if (payload instanceof Map) {
//                 return objectMapper.convertValue(payload, dtoClass);
//             }

//             // If already the correct type
//             if (dtoClass.isInstance(payload)) {
//                 return dtoClass.cast(payload);
//             }

//             throw new IllegalArgumentException("Unsupported payload type: " + payload.getClass().getName());
//         } catch (Exception e) {
//             log.error("Failed to convert payload to {}: {}. Payload type: {}",
//                     dtoClass.getSimpleName(), e.getMessage(), payload.getClass().getName());
//             throw new RuntimeException("Failed to convert event payload", e);
//         }
//     }

//     /**
//      * Consumes expense events from Kafka
//      * Topic: expense-events
//      * Group: notification-service-group
//      */
//     @KafkaListener(topics = "${kafka.topics.expense-events:expense-events}", groupId = "${kafka.consumer.group-id:notification-service-group}", containerFactory = "kafkaListenerContainerFactory")
//     public void consumeExpenseEvent(Object payload) {
//         try {
//             ExpenseEventDTO event = convertToDto(payload, ExpenseEventDTO.class);

//             log.info("Received expense event for user {}: {} - {}",
//                     event.getUserId(), event.getAction(), event.getDescription());

//             expenseEventProcessor.process(event);

//             log.info("Successfully processed expense event for user {}", event.getUserId());
//         } catch (Exception e) {
//             log.error("Error processing expense event: {}", e.getMessage(), e);
//         }
//     }

//     /**
//      * Consumes budget events from Kafka
//      * Topic: budget-events
//      * Group: notification-service-group
//      */
//     @KafkaListener(topics = "${kafka.topics.budget-events:budget-events}", groupId = "${kafka.consumer.group-id:notification-service-group}", containerFactory = "kafkaListenerContainerFactory")
//     public void consumeBudgetEvent(Object payload) {
//         try {
//             BudgetEventDTO event = convertToDto(payload, BudgetEventDTO.class);

//             log.info("Received budget event for user {}: {} - {}",
//                     event.getUserId(), event.getAction(), event.getBudgetName());

//             budgetEventProcessor.process(event);

//             log.info("Successfully processed budget event for user {}", event.getUserId());
//         } catch (Exception e) {
//             log.error("Error processing budget event: {}", e.getMessage(), e);
//         }
//     }

//     /**
//      * Consumes bill events from Kafka
//      * Topic: bill-events
//      * Group: notification-service-group
//      */
//     @KafkaListener(topics = "${kafka.topics.bill-events:bill-events}", groupId = "${kafka.consumer.group-id:notification-service-group}", containerFactory = "kafkaListenerContainerFactory")
//     public void consumeBillEvent(Object payload) {
//         try {
//             BillEventDTO event = convertToDto(payload, BillEventDTO.class);

//             log.info("Received bill event for user {}: {} - {}",
//                     event.getUserId(), event.getAction(), event.getName());

//             billEventProcessor.process(event);

//             log.info("Successfully processed bill event for user {}", event.getUserId());
//         } catch (Exception e) {
//             log.error("Error processing bill event: {}", e.getMessage(), e);
//         }
//     }

//     /**
//      * Consumes payment method events from Kafka
//      * Topic: payment-method-events
//      * Group: notification-service-group
//      */
//     @KafkaListener(topics = "${kafka.topics.payment-method-events:payment-method-events}", groupId = "${kafka.consumer.group-id:notification-service-group}", containerFactory = "kafkaListenerContainerFactory")
//     public void consumePaymentMethodEvent(Object payload) {
//         try {
//             PaymentMethodEventDTO event = convertToDto(payload, PaymentMethodEventDTO.class);

//             log.info("Received payment method event for user {}: {} - {}",
//                     event.getUserId(), event.getEventType(), event.getPaymentMethodName());

//             paymentMethodEventProcessor.process(event);

//             log.info("Successfully processed payment method event for user {}", event.getUserId());
//         } catch (Exception e) {
//             log.error("Error processing payment method event: {}", e.getMessage(), e);
//         }
//     }

//     /**
//      * Consumes friend/friendship events from Kafka
//      * Topic: friend-events or friendship-events
//      * Group: notification-service-group
//      */
//     @KafkaListener(topics = { "${kafka.topics.friend-events:friend-events}",
//             "${kafka.topics.friendship-events:friendship-events}" }, groupId = "${kafka.consumer.group-id:notification-service-group}", containerFactory = "kafkaListenerContainerFactory")
//     public void consumeFriendEvent(Object payload) {
//         try {
//             FriendEventDTO event = convertToDto(payload, FriendEventDTO.class);

//             log.info("Received friend event for user {}: {} - {}",
//                     event.getUserId(), event.getAction(), event.getFriendName());

//             friendEventProcessor.process(event);

//             log.info("Successfully processed friend event for user {}", event.getUserId());
//         } catch (Exception e) {
//             log.error("Error processing friend event: {}", e.getMessage(), e);
//         }
//     }

//     /**
//      * Consumes friend request events from Kafka (alternative event structure)
//      * Topic: friend-request-events
//      * Group: notification-service-group
//      */
//     @KafkaListener(topics = "${kafka.topics.friend-request-events:friend-request-events}", groupId = "${kafka.consumer.group-id:notification-service-group}", containerFactory = "kafkaListenerContainerFactory")
//     public void consumeFriendRequestEvent(Object payload) {
//         try {
//             FriendRequestEventDTO event = convertToDto(payload, FriendRequestEventDTO.class);

//             log.info("Received friend request event: {} from user {} to user {}",
//                     event.getEventType(), event.getRequesterId(), event.getRecipientId());

//             // Convert FriendRequestEventDTO to FriendEventDTO
//             FriendEventDTO friendEvent = convertToFriendEvent(event);
//             friendEventProcessor.process(friendEvent);

//             log.info("Successfully processed friend request event");
//         } catch (Exception e) {
//             log.error("Error processing friend request event: {}", e.getMessage(), e);
//         }
//     }

//     /**
//      * Converts FriendRequestEventDTO to FriendEventDTO for processing
//      */
//     private FriendEventDTO convertToFriendEvent(FriendRequestEventDTO requestEvent) {
//         // Determine which user should receive the notification
//         Integer userId;
//         Integer friendId;
//         String friendName;
//         String action;

//         switch (requestEvent.getEventType()) {
//             case "FRIEND_REQUEST_SENT":
//                 // Notify recipient about new request
//                 userId = requestEvent.getRecipientId();
//                 friendId = requestEvent.getRequesterId();
//                 friendName = requestEvent.getRequesterName();
//                 action = "REQUEST_RECEIVED";
//                 break;

//             case "FRIEND_REQUEST_ACCEPTED":
//                 // Notify requester that request was accepted
//                 userId = requestEvent.getRequesterId();
//                 friendId = requestEvent.getRecipientId();
//                 friendName = requestEvent.getRecipientName();
//                 action = "REQUEST_ACCEPTED";
//                 break;

//             case "FRIEND_REQUEST_REJECTED":
//                 // Notify requester that request was rejected
//                 userId = requestEvent.getRequesterId();
//                 friendId = requestEvent.getRecipientId();
//                 friendName = requestEvent.getRecipientName();
//                 action = "REQUEST_REJECTED";
//                 break;

//             default:
//                 userId = requestEvent.getRecipientId();
//                 friendId = requestEvent.getRequesterId();
//                 friendName = requestEvent.getRequesterName();
//                 action = "REQUEST_RECEIVED";
//         }

//         return FriendEventDTO.builder()
//                 .friendshipId(requestEvent.getFriendshipId())
//                 .userId(userId)
//                 .friendId(friendId)
//                 .action(action)
//                 .friendName(friendName)
//                 .friendEmail(userId.equals(requestEvent.getRecipientId())
//                         ? requestEvent.getRequesterEmail()
//                         : requestEvent.getRecipientEmail())
//                 .friendProfileImage(userId.equals(requestEvent.getRecipientId())
//                         ? requestEvent.getRequesterImage()
//                         : requestEvent.getRecipientImage())
//                 .timestamp(requestEvent.getTimestamp())
//                 .metadata(requestEvent.getMessage())
//                 .build();
//     }
// }
