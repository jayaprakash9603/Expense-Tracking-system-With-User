package com.jaya.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.UnifiedActivityEvent;
import com.jaya.kafka.events.UnifiedActivityEvent.UserInfo;
import com.jaya.kafka.producer.UnifiedActivityEventProducer;
import com.jaya.models.Category;
import com.jaya.common.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnifiedActivityService {

    private final UnifiedActivityEventProducer eventProducer;
    private final ObjectMapper objectMapper;

    
    @Async("friendActivityExecutor")
    public void sendCategoryCreatedEvent(Category category, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Category '%s' created", category.getName())
                    : String.format("%s created category '%s'", actorName, category.getName());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.CATEGORY)
                    .entityId(category.getId().longValue())
                    .entityName(category.getName())
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorEmail(actorUser.getEmail())
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.CATEGORY_SERVICE)
                    .newValues(buildCategoryPayload(category))
                    .entityPayload(buildCategoryPayload(category))
                    .metadata(buildCategoryMetadata(category))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Category CREATED - categoryId={}, actorId={}, targetId={}, isOwnAction={}",
                    category.getId(), actorUser.getId(), targetUser.getId(), isOwnAction);

        } catch (Exception e) {
            log.error("Failed to send category created event: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendBulkCategoriesCreatedEvent(List<Category> categories, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Created %d categories", categories.size())
                    : String.format("%s created %d categories", actorName, categories.size());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.CATEGORY)
                    .entityName("Bulk Categories")
                    .action(UnifiedActivityEvent.Action.CREATE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.CATEGORY_SERVICE)
                    .metadata(String.format("{\"count\": %d}", categories.size()))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Bulk Categories CREATED - count={}, actorId={}, targetId={}",
                    categories.size(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send bulk categories created event: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendCategoryUpdatedEvent(Category category, Category oldCategory, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Category '%s' updated", category.getName())
                    : String.format("%s updated category '%s'", actorName, category.getName());

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.CATEGORY)
                    .entityId(category.getId().longValue())
                    .entityName(category.getName())
                    .action(UnifiedActivityEvent.Action.UPDATE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.CATEGORY_SERVICE)
                    .oldValues(oldCategory != null ? buildCategoryPayload(oldCategory) : null)
                    .newValues(buildCategoryPayload(category))
                    .entityPayload(buildCategoryPayload(category))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Category UPDATED - categoryId={}, actorId={}, targetId={}",
                    category.getId(), actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send category updated event: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendMultipleCategoriesUpdatedEvent(List<Category> categories, UserDTO actorUser, UserDTO targetUser) {
        try {
            int count = categories != null ? categories.size() : 0;
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("%d categories updated", count)
                    : String.format("%s updated %d categories", actorName, count);

            String metadata = buildMultipleCategoriesMetadata(categories);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.CATEGORY)
                    .entityName("Multiple Categories")
                    .action(UnifiedActivityEvent.Action.UPDATE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.CATEGORY_SERVICE)
                    .metadata(metadata)
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Multiple Categories UPDATED - count={}, actorId={}, targetId={}",
                    count, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send multiple categories updated event: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendCategoryDeletedEvent(Integer categoryId, String categoryName, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("Category '%s' deleted", categoryName)
                    : String.format("%s deleted category '%s'", actorName, categoryName);

            Map<String, Object> oldValues = new HashMap<>();
            oldValues.put("id", categoryId);
            oldValues.put("name", categoryName);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.CATEGORY)
                    .entityId(categoryId.longValue())
                    .entityName(categoryName)
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.CATEGORY_SERVICE)
                    .oldValues(oldValues)
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Category DELETED - categoryId={}, actorId={}, targetId={}",
                    categoryId, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send category deleted event: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendMultipleCategoriesDeletedEvent(int count, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("%d categories deleted", count)
                    : String.format("%s deleted %d categories", actorName, count);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.CATEGORY)
                    .entityName("Multiple Categories")
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.CATEGORY_SERVICE)
                    .metadata(String.format("{\"deletedCount\": %d}", count))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: Multiple Categories DELETED - count={}, actorId={}, targetId={}",
                    count, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send multiple categories deleted event: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendAllCategoriesDeletedEvent(int count, UserDTO actorUser, UserDTO targetUser) {
        try {
            boolean isOwnAction = actorUser.getId().equals(targetUser.getId());
            String actorName = getDisplayName(actorUser);

            String description = isOwnAction
                    ? String.format("All %d categories deleted", count)
                    : String.format("%s deleted all %d categories", actorName, count);

            UnifiedActivityEvent event = UnifiedActivityEvent.builder()
                    .entityType(UnifiedActivityEvent.EntityType.CATEGORY)
                    .entityName("All Categories")
                    .action(UnifiedActivityEvent.Action.DELETE)
                    .description(description)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUserId(targetUser.getId())
                    .targetUserName(getDisplayName(targetUser))
                    .targetUser(buildUserInfo(targetUser))
                    .sourceService(UnifiedActivityEvent.SourceService.CATEGORY_SERVICE)
                    .metadata(String.format("{\"deletedCount\": %d}", count))
                    .isOwnAction(isOwnAction)
                    .isFriendActivity(!isOwnAction)
                    .requiresAudit(true)
                    .requiresNotification(true)
                    .status(UnifiedActivityEvent.Status.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            eventProducer.sendEvent(event);
            log.info("Unified event sent: All Categories DELETED - count={}, actorId={}, targetId={}",
                    count, actorUser.getId(), targetUser.getId());

        } catch (Exception e) {
            log.error("Failed to send all categories deleted event: {}", e.getMessage(), e);
        }
    }

    private UserInfo buildUserInfo(UserDTO UserDTO) {
        if (UserDTO == null)
            return null;

        String fullName = buildFullName(UserDTO);
        return UserInfo.builder()
                .id(UserDTO.getId())
                .username(UserDTO.getUsername())
                .email(UserDTO.getEmail())
                .firstName(UserDTO.getFirstName())
                .lastName(UserDTO.getLastName())
                .fullName(fullName)
                .image(UserDTO.getImage())
                .build();
    }

    private String buildFullName(UserDTO UserDTO) {
        if (UserDTO == null)
            return null;
        if (UserDTO.getFirstName() != null && UserDTO.getLastName() != null) {
            return UserDTO.getFirstName() + " " + UserDTO.getLastName();
        }
        if (UserDTO.getFirstName() != null) {
            return UserDTO.getFirstName();
        }
        return UserDTO.getUsername();
    }

    private String getDisplayName(UserDTO UserDTO) {
        if (UserDTO == null)
            return "Unknown";
        String fullName = buildFullName(UserDTO);
        if (fullName != null && !fullName.isEmpty()) {
            return fullName;
        }
        return UserDTO.getUsername() != null ? UserDTO.getUsername() : UserDTO.getEmail();
    }

    private Map<String, Object> buildCategoryPayload(Category category) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", category.getId());
        payload.put("name", category.getName());
        payload.put("color", category.getColor());
        payload.put("type", category.getType());
        payload.put("description", category.getDescription());
        payload.put("icon", category.getIcon());
        payload.put("isGlobal", category.isGlobal());
        return payload;
    }

    private String buildCategoryMetadata(Category category) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("color", category.getColor());
            metadata.put("type", category.getType());
            metadata.put("isGlobal", category.isGlobal());
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String buildMultipleCategoriesMetadata(List<Category> categories) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            int count = categories != null ? categories.size() : 0;
            metadata.put("updatedCount", count);
            if (categories != null && !categories.isEmpty()) {
                List<Map<String, Object>> categoryList = categories.stream()
                        .map(c -> {
                            Map<String, Object> item = new HashMap<>();
                            item.put("id", c.getId());
                            item.put("name", c.getName());
                            return item;
                        })
                        .collect(Collectors.toList());
                metadata.put("categories", categoryList);
            }
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            return String.format("{\"updatedCount\": %d}", categories != null ? categories.size() : 0);
        }
    }
}
