package com.jaya.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.dto.UnifiedActivityEventDTO;
import com.jaya.models.FriendActivity;
import com.jaya.repository.FriendActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component("friendshipUnifiedActivityEventConsumer")
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityEventConsumer {

    private final FriendActivityRepository friendActivityRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topics.unified-activity-events:unified-activity-events}", groupId = "${kafka.consumer.group-id:friendship-unified-activity-group}", containerFactory = "kafkaListenerContainerFactory")
    @Transactional
    public void consumeUnifiedActivityEvent(
            Object payload,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        try {
            UnifiedActivityEventDTO event = convertToDto(payload);

            if (event == null) {
                log.warn("Failed to parse unified event from topic: {}, offset: {}", topic, offset);
                acknowledgment.acknowledge();
                return;
            }

            if (!Boolean.TRUE.equals(event.getIsFriendActivity())) {
                log.debug("Skipping non-friend-activity event: {} (isOwnAction={})",
                        event.getEventId(), event.getIsOwnAction());
                acknowledgment.acknowledge();
                return;
            }

            log.info(
                    "Processing friend activity event: eventId={}, actorUserId={}, targetUserId={}, action={}, entityType={}",
                    event.getEventId(), event.getActorUserId(), event.getTargetUserId(),
                    event.getAction(), event.getEntityType());

            if (!isValidEvent(event)) {
                log.warn("Invalid unified activity event received, skipping: {}", event.getEventId());
                acknowledgment.acknowledge();
                return;
            }

            FriendActivity activity = mapEventToEntity(event);
            FriendActivity savedActivity = friendActivityRepository.save(activity);

            log.info("Friend activity saved: id={}, targetUserId={}, action={}, sourceService={}",
                    savedActivity.getId(), savedActivity.getTargetUserId(),
                    savedActivity.getAction(), savedActivity.getSourceService());

            acknowledgment.acknowledge();

        } catch (Exception e) {
            log.error("Error processing unified activity event from topic: {}, offset: {}",
                    topic, offset, e);
            acknowledgment.acknowledge();
        }
    }

    public void consumeUnifiedActivityEventsBatch(
            @Payload List<ConsumerRecord<String, Object>> records,
            Acknowledgment acknowledgment) {

        if (records == null || records.isEmpty()) {
            acknowledgment.acknowledge();
            return;
        }

        log.info("Received batch of {} unified activity events", records.size());

        int processedCount = 0;
        int skippedCount = 0;

        for (ConsumerRecord<String, Object> record : records) {
            try {
                Object payload = record.value();
                UnifiedActivityEventDTO event = convertToDto(payload);

                if (event == null) {
                    skippedCount++;
                    continue;
                }

                if (!Boolean.TRUE.equals(event.getIsFriendActivity())) {
                    skippedCount++;
                    continue;
                }

                if (!isValidEvent(event)) {
                    skippedCount++;
                    continue;
                }

                FriendActivity activity = mapEventToEntity(event);
                friendActivityRepository.save(activity);
                processedCount++;

            } catch (Exception e) {
                log.error("Error processing event in batch: {}", e.getMessage());
                skippedCount++;
            }
        }

        log.info("Batch processing complete: processed={}, skipped={}", processedCount, skippedCount);
        acknowledgment.acknowledge();
    }

    private UnifiedActivityEventDTO convertToDto(Object payload) {
        try {
            if (payload instanceof ConsumerRecord) {
                ConsumerRecord<?, ?> record = (ConsumerRecord<?, ?>) payload;
                payload = record.value();
                log.debug("Extracted value from ConsumerRecord: {}",
                        payload != null ? payload.getClass().getName() : "null");
            }

            if (payload == null) {
                log.warn("Payload is null after extraction");
                return null;
            }

            if (payload instanceof UnifiedActivityEventDTO) {
                return (UnifiedActivityEventDTO) payload;
            } else if (payload instanceof String) {
                return objectMapper.readValue((String) payload, UnifiedActivityEventDTO.class);
            } else if (payload instanceof Map) {
                return objectMapper.convertValue(payload, UnifiedActivityEventDTO.class);
            } else if (payload instanceof java.util.LinkedHashMap) {
                return objectMapper.convertValue(payload, UnifiedActivityEventDTO.class);
            } else {
                String json = objectMapper.writeValueAsString(payload);
                return objectMapper.readValue(json, UnifiedActivityEventDTO.class);
            }
        } catch (Exception e) {
            log.error("Failed to convert payload to UnifiedActivityEventDTO: {}", e.getMessage());
            return null;
        }
    }

    private boolean isValidEvent(UnifiedActivityEventDTO event) {
        if (event == null) {
            return false;
        }
        if (event.getTargetUserId() == null) {
            log.warn("Unified activity event missing targetUserId: {}", event.getEventId());
            return false;
        }
        if (event.getActorUserId() == null) {
            log.warn("Unified activity event missing actorUserId: {}", event.getEventId());
            return false;
        }
        if (event.getAction() == null) {
            log.warn("Unified activity event missing action: {}", event.getEventId());
            return false;
        }
        return true;
    }

    private FriendActivity mapEventToEntity(UnifiedActivityEventDTO event) {
        return FriendActivity.builder()
                .targetUserId(toInteger(event.getTargetUserId()))
                .actorUserId(toInteger(event.getActorUserId()))
                .actorUserName(event.getActorUserName())
                .sourceService(mapSourceService(event.getSourceService()))
                .entityType(mapEntityType(event.getEntityType()))
                .entityId(toInteger(event.getEntityId()))
                .action(mapAction(event.getAction()))
                .description(event.getDescription())
                .amount(toDouble(event.getAmount()))
                .metadata(toJson(event.getMetadata()))
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : LocalDateTime.now())
                .isRead(false)
                .actorUserJson(toJson(event.getActorUser()))
                .targetUserJson(toJson(event.getTargetUser()))
                .entityPayloadJson(toJson(event.getEntityPayload()))
                .previousEntityStateJson(toJson(event.getOldValues()))
                .actorIpAddress(event.getIpAddress())
                .actorUserAgent(event.getUserAgent())
                .build();
    }

    private Integer toInteger(Long value) {
        return value != null ? value.intValue() : null;
    }

    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }

    private String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize object to JSON: {}", e.getMessage());
            return null;
        }
    }

    private FriendActivity.SourceService mapSourceService(String source) {
        if (source == null || source.isEmpty()) {
            return FriendActivity.SourceService.EXPENSE;
        }
        String normalized = source.toUpperCase()
                .replace("-SERVICE", "")
                .replace("_SERVICE", "")
                .replace("-", "_");
        try {
            return FriendActivity.SourceService.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            log.warn("Unknown source service: {}, defaulting to EXPENSE", source);
            return FriendActivity.SourceService.EXPENSE;
        }
    }

    private FriendActivity.EntityType mapEntityType(String type) {
        if (type == null || type.isEmpty()) {
            return FriendActivity.EntityType.EXPENSE;
        }
        try {
            return FriendActivity.EntityType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown entity type: {}, defaulting to EXPENSE", type);
            return FriendActivity.EntityType.EXPENSE;
        }
    }

    private FriendActivity.Action mapAction(String action) {
        if (action == null || action.isEmpty()) {
            return FriendActivity.Action.CREATE;
        }
        try {
            return FriendActivity.Action.valueOf(action.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown action: {}, defaulting to CREATE", action);
            return FriendActivity.Action.CREATE;
        }
    }
}
