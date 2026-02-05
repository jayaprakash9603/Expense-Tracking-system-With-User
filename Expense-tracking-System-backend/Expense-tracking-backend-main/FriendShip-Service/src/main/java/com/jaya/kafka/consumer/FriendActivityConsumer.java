package com.jaya.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.models.FriendActivity;
import com.jaya.repository.FriendActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class FriendActivityConsumer {

    private final FriendActivityRepository friendActivityRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topics.friend-activity-events:friend-activity-events}", groupId = "${kafka.consumer.group-id:friendship-activity-group}", containerFactory = "kafkaListenerContainerFactory")
    @Transactional
    public void consumeFriendActivity(FriendActivityEvent event) {
        try {
            log.info("Received friend activity event: actorUserId={}, targetUserId={}, action={}, entityType={}",
                    event.getActorUserId(), event.getTargetUserId(), event.getAction(), event.getEntityType());

            if (!isValidEvent(event)) {
                log.warn("Invalid friend activity event received, skipping: {}", event);
                return;
            }

            FriendActivity activity = mapEventToEntity(event);
            FriendActivity savedActivity = friendActivityRepository.save(activity);

            log.info("Friend activity saved: id={}, targetUserId={}, action={}, hasActorUser={}, hasEntityPayload={}",
                    savedActivity.getId(), savedActivity.getTargetUserId(), savedActivity.getAction(),
                    savedActivity.getActorUserJson() != null, savedActivity.getEntityPayloadJson() != null);

        } catch (Exception e) {
            log.error("Error processing friend activity event: {}", e.getMessage(), e);
        }
    }

    private boolean isValidEvent(FriendActivityEvent event) {
        if (event == null) {
            return false;
        }
        if (event.getTargetUserId() == null) {
            log.warn("Friend activity event missing targetUserId");
            return false;
        }
        if (event.getActorUserId() == null) {
            log.warn("Friend activity event missing actorUserId");
            return false;
        }
        if (event.getAction() == null) {
            log.warn("Friend activity event missing action");
            return false;
        }
        if (event.getSourceService() == null) {
            log.warn("Friend activity event missing sourceService");
            return false;
        }
        return true;
    }

    private FriendActivity mapEventToEntity(FriendActivityEvent event) {
        return FriendActivity.builder()
                .targetUserId(event.getTargetUserId())
                .actorUserId(event.getActorUserId())
                .actorUserName(event.getActorUserName())
                .sourceService(mapSourceService(event.getSourceService()))
                .entityType(mapEntityType(event.getEntityType()))
                .entityId(event.getEntityId())
                .action(mapAction(event.getAction()))
                .description(event.getDescription())
                .amount(event.getAmount())
                .metadata(event.getMetadata())
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : java.time.LocalDateTime.now())
                .isRead(event.getIsRead() != null ? event.getIsRead() : false)
                .actorUserJson(toJson(event.getActorUser()))
                .targetUserJson(toJson(event.getTargetUser()))
                .entityPayloadJson(toJson(event.getEntityPayload()))
                .previousEntityStateJson(toJson(event.getPreviousEntityState()))
                .actorIpAddress(event.getActorIpAddress())
                .actorUserAgent(event.getActorUserAgent())
                .build();
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
        try {
            return FriendActivity.SourceService.valueOf(source.toUpperCase());
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
