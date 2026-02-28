package com.jaya.kafka.service;

import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.Category;
import com.jaya.common.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FriendActivityService {

    private final FriendActivityProducer friendActivityProducer;

    
    @Async("friendActivityExecutor")
    public void sendCategoryCreatedByFriend(Category category, Integer targetUserId, UserDTO actorUser) {
        sendCategoryCreatedByFriendInternal(category, targetUserId, actorUser, null);
    }

    
    @Async("friendActivityExecutor")
    public void sendCategoryCreatedByFriend(Category category, Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        sendCategoryCreatedByFriendInternal(category, targetUserId, actorUser, targetUser);
    }

    
    private void sendCategoryCreatedByFriendInternal(Category category, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                log.debug("Skipping friend activity notification - UserDTO creating own category");
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(category.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created category '%s'", actorName, category.getName()))
                    .amount(null)
                    .metadata(buildCategoryMetadata(category))
                    .entityPayload(buildCategoryPayload(category))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} created category {} for UserDTO {}",
                    actorUser.getId(), category.getId(), targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for category creation: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendBulkCategoriesCreatedByFriend(List<Category> categories, Integer targetUserId, UserDTO actorUser) {
        sendBulkCategoriesCreatedByFriendInternal(categories, targetUserId, actorUser, null);
    }

    
    @Async("friendActivityExecutor")
    public void sendBulkCategoriesCreatedByFriend(List<Category> categories, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        sendBulkCategoriesCreatedByFriendInternal(categories, targetUserId, actorUser, targetUser);
    }

    
    private void sendBulkCategoriesCreatedByFriendInternal(List<Category> categories, Integer targetUserId,
            UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            Map<String, Object> bulkPayload = new HashMap<>();
            bulkPayload.put("categoryCount", categories.size());
            bulkPayload.put("categories", categories.stream().map(this::buildCategoryPayload).toList());

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created %d categories", actorName, categories.size()))
                    .amount(null)
                    .entityPayload(bulkPayload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk category creation: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendCategoryUpdatedByFriend(Category category, Integer targetUserId, UserDTO actorUser) {
        sendCategoryUpdatedByFriendInternal(category, null, targetUserId, actorUser, null);
    }

    
    @Async("friendActivityExecutor")
    public void sendCategoryUpdatedByFriend(Category category, Category previousCategory, Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        sendCategoryUpdatedByFriendInternal(category, previousCategory, targetUserId, actorUser, targetUser);
    }

    
    private void sendCategoryUpdatedByFriendInternal(Category category, Category previousCategory, Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(category.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated category '%s'", actorName, category.getName()))
                    .amount(null)
                    .entityPayload(buildCategoryPayload(category))
                    .previousEntityState(previousCategory != null ? buildCategoryPayload(previousCategory) : null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for category update: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendBulkCategoriesUpdatedByFriend(List<Category> categories, Integer targetUserId, UserDTO actorUser) {
        sendBulkCategoriesUpdatedByFriendInternal(categories, targetUserId, actorUser, null);
    }

    
    @Async("friendActivityExecutor")
    public void sendBulkCategoriesUpdatedByFriend(List<Category> categories, Integer targetUserId, UserDTO actorUser,
            UserDTO targetUser) {
        sendBulkCategoriesUpdatedByFriendInternal(categories, targetUserId, actorUser, targetUser);
    }

    
    private void sendBulkCategoriesUpdatedByFriendInternal(List<Category> categories, Integer targetUserId,
            UserDTO actorUser,
            UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            Map<String, Object> bulkPayload = new HashMap<>();
            bulkPayload.put("categoryCount", categories.size());
            bulkPayload.put("categories", categories.stream().map(this::buildCategoryPayload).toList());

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated %d categories", actorName, categories.size()))
                    .amount(null)
                    .entityPayload(bulkPayload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk category update: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendCategoryDeletedByFriend(Integer categoryId, String categoryName,
            Integer targetUserId, UserDTO actorUser) {
        sendCategoryDeletedByFriendInternal(categoryId, categoryName, null, targetUserId, actorUser, null);
    }

    
    @Async("friendActivityExecutor")
    public void sendCategoryDeletedByFriend(Integer categoryId, String categoryName, Category deletedCategory,
            Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        sendCategoryDeletedByFriendInternal(categoryId, categoryName, deletedCategory, targetUserId, actorUser,
                targetUser);
    }

    
    private void sendCategoryDeletedByFriendInternal(Integer categoryId, String categoryName, Category deletedCategory,
            Integer targetUserId, UserDTO actorUser, UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(categoryId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted category '%s'", actorName,
                            categoryName != null ? categoryName : "Unknown"))
                    .amount(null)
                    .entityPayload(deletedCategory != null ? buildCategoryPayload(deletedCategory) : null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for category deletion: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendBulkCategoriesDeletedByFriend(int count, Integer targetUserId, UserDTO actorUser) {
        sendBulkCategoriesDeletedByFriendInternal(count, null, targetUserId, actorUser, null);
    }

    
    @Async("friendActivityExecutor")
    public void sendBulkCategoriesDeletedByFriend(int count, List<Category> deletedCategories, Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        sendBulkCategoriesDeletedByFriendInternal(count, deletedCategories, targetUserId, actorUser, targetUser);
    }

    
    private void sendBulkCategoriesDeletedByFriendInternal(int count, List<Category> deletedCategories,
            Integer targetUserId,
            UserDTO actorUser, UserDTO targetUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            Map<String, Object> payload = new HashMap<>();
            payload.put("deletedCount", count);
            if (deletedCategories != null && !deletedCategories.isEmpty()) {
                payload.put("deletedCategories", deletedCategories.stream().map(this::buildCategoryPayload).toList());
            }

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted %d categories", actorName, count))
                    .amount(null)
                    .entityPayload(payload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk category deletion: {}", e.getMessage(), e);
        }
    }

    
    @Async("friendActivityExecutor")
    public void sendAllCategoriesDeletedByFriend(Integer targetUserId, UserDTO actorUser, int count) {
        sendAllCategoriesDeletedByFriendInternal(targetUserId, actorUser, null, count, null);
    }

    
    @Async("friendActivityExecutor")
    public void sendAllCategoriesDeletedByFriend(Integer targetUserId, UserDTO actorUser, UserDTO targetUser, int count,
            List<Category> deletedCategories) {
        sendAllCategoriesDeletedByFriendInternal(targetUserId, actorUser, targetUser, count, deletedCategories);
    }

    
    private void sendAllCategoriesDeletedByFriendInternal(Integer targetUserId, UserDTO actorUser, UserDTO targetUser,
            int count, List<Category> deletedCategories) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);
            Map<String, Object> payload = new HashMap<>();
            payload.put("deletedCount", count);
            if (deletedCategories != null && !deletedCategories.isEmpty()) {
                payload.put("deletedCategories", deletedCategories.stream().map(this::buildCategoryPayload).toList());
            }

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .actorUser(buildUserInfo(actorUser))
                    .targetUser(targetUser != null ? buildUserInfo(targetUser) : null)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted all categories (%d items)", actorName, count))
                    .amount(null)
                    .entityPayload(payload)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for all categories deletion: {}", e.getMessage(), e);
        }
    }

    private String getActorDisplayName(UserDTO UserDTO) {
        if (UserDTO.getFirstName() != null && !UserDTO.getFirstName().isEmpty()) {
            if (UserDTO.getLastName() != null && !UserDTO.getLastName().isEmpty()) {
                return UserDTO.getFirstName() + " " + UserDTO.getLastName();
            }
            return UserDTO.getFirstName();
        }
        return UserDTO.getUsername() != null ? UserDTO.getUsername() : "A friend";
    }

    
    private FriendActivityEvent.UserInfo buildUserInfo(UserDTO UserDTO) {
        if (UserDTO == null)
            return null;

        String fullName = getActorDisplayName(UserDTO);

        return FriendActivityEvent.UserInfo.builder()
                .id(UserDTO.getId())
                .username(UserDTO.getUsername())
                .email(UserDTO.getEmail())
                .firstName(UserDTO.getFirstName())
                .lastName(UserDTO.getLastName())
                .fullName(fullName)
                .image(UserDTO.getImage())
                .phoneNumber(UserDTO.getMobile())
                .build();
    }

    
    private Map<String, Object> buildCategoryPayload(Category category) {
        if (category == null)
            return null;

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", category.getId());
        payload.put("userId", category.getUserId());
        payload.put("name", category.getName());
        payload.put("description", category.getDescription());
        payload.put("type", category.getType());
        payload.put("icon", category.getIcon());
        payload.put("color", category.getColor());
        payload.put("isGlobal", category.isGlobal());

        return payload;
    }

    private String buildCategoryMetadata(Category category) {
        return String.format("{\"type\":\"%s\",\"icon\":\"%s\",\"color\":\"%s\"}",
                category.getType() != null ? category.getType() : "",
                category.getIcon() != null ? category.getIcon() : "",
                category.getColor() != null ? category.getColor() : "");
    }
}
