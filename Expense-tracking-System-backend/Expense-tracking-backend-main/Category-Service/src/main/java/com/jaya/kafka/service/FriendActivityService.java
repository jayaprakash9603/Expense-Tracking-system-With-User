package com.jaya.kafka.service;

import com.jaya.kafka.events.FriendActivityEvent;
import com.jaya.kafka.producer.FriendActivityProducer;
import com.jaya.models.Category;
import com.jaya.models.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for sending friend activity notifications for category operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FriendActivityService {

    private final FriendActivityProducer friendActivityProducer;

    /**
     * Send notification when a friend creates a category on behalf of another user.
     */
    public void sendCategoryCreatedByFriend(Category category, Integer targetUserId, User actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                log.debug("Skipping friend activity notification - user creating own category");
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(category.getId())
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created category '%s'", actorName, category.getName()))
                    .amount(null)
                    .metadata(buildCategoryMetadata(category))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);
            log.info("Friend activity event sent: {} created category {} for user {}",
                    actorUser.getId(), category.getId(), targetUserId);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for category creation: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend creates multiple categories.
     */
    public void sendBulkCategoriesCreatedByFriend(List<Category> categories, Integer targetUserId, User actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.CREATE)
                    .description(String.format("%s created %d categories", actorName, categories.size()))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk category creation: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend updates a category.
     */
    public void sendCategoryUpdatedByFriend(Category category, Integer targetUserId, User actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(category.getId())
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated category '%s'", actorName, category.getName()))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for category update: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend updates multiple categories.
     */
    public void sendBulkCategoriesUpdatedByFriend(List<Category> categories, Integer targetUserId, User actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.UPDATE)
                    .description(String.format("%s updated %d categories", actorName, categories.size()))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk category update: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes a category.
     */
    public void sendCategoryDeletedByFriend(Integer categoryId, String categoryName,
            Integer targetUserId, User actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(categoryId)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted category '%s'",
                            actorName, categoryName != null ? categoryName : "a category"))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for category deletion: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes multiple categories.
     */
    public void sendBulkCategoriesDeletedByFriend(int count, Integer targetUserId, User actorUser) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted %d categories", actorName, count))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for bulk category deletion: {}", e.getMessage(), e);
        }
    }

    /**
     * Send notification when a friend deletes all categories.
     */
    public void sendAllCategoriesDeletedByFriend(Integer targetUserId, User actorUser, int count) {
        try {
            if (targetUserId.equals(actorUser.getId())) {
                return;
            }

            String actorName = getActorDisplayName(actorUser);

            FriendActivityEvent event = FriendActivityEvent.builder()
                    .targetUserId(targetUserId)
                    .actorUserId(actorUser.getId())
                    .actorUserName(actorName)
                    .sourceService(FriendActivityEvent.SourceService.CATEGORY)
                    .entityType(FriendActivityEvent.EntityType.CATEGORY)
                    .entityId(null)
                    .action(FriendActivityEvent.Action.DELETE)
                    .description(String.format("%s deleted all categories (%d items)", actorName, count))
                    .amount(null)
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .build();

            friendActivityProducer.sendEvent(event);

        } catch (Exception e) {
            log.error("Failed to send friend activity notification for all categories deletion: {}", e.getMessage(), e);
        }
    }

    private String getActorDisplayName(User user) {
        if (user.getFirstName() != null && !user.getFirstName().isEmpty()) {
            if (user.getLastName() != null && !user.getLastName().isEmpty()) {
                return user.getFirstName() + " " + user.getLastName();
            }
            return user.getFirstName();
        }
        return user.getUsername() != null ? user.getUsername() : "A friend";
    }

    private String buildCategoryMetadata(Category category) {
        return String.format("{\"type\":\"%s\",\"icon\":\"%s\",\"color\":\"%s\"}",
                category.getType() != null ? category.getType() : "",
                category.getIcon() != null ? category.getIcon() : "",
                category.getColor() != null ? category.getColor() : "");
    }
}
