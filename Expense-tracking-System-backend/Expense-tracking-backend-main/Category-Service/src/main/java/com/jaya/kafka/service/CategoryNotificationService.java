package com.jaya.kafka.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.kafka.events.CategoryNotificationEvent;
import com.jaya.kafka.producer.CategoryNotificationProducer;
import com.jaya.models.Category;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for creating and sending category notification events
 * Follows Single Responsibility Principle - only responsible for event creation
 * and dispatch
 * 
 * This service sends notifications to users when they perform CRUD operations
 * on categories.
 * It follows the same pattern as ExpenseNotificationService for consistency.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryNotificationService {

    private final CategoryNotificationProducer categoryNotificationProducer;
    private final ObjectMapper objectMapper;

    /**
     * Send notification when category is created
     */
    public void sendCategoryCreatedNotification(Category category) {
        try {
            CategoryNotificationEvent event = buildCategoryEvent(
                    category,
                    CategoryNotificationEvent.Action.CREATE);

            categoryNotificationProducer.sendEvent(event);
            log.info("Sent category created notification for categoryId: {}, userId: {}",
                    category.getId(), category.getUserId());
        } catch (Exception e) {
            log.error("Failed to send category created notification for categoryId: {}",
                    category.getId(), e);
            // Don't throw - notification failure shouldn't break main flow
        }
    }

    /**
     * Send notification when category is updated
     */
    public void sendCategoryUpdatedNotification(Category category) {
        try {
            CategoryNotificationEvent event = buildCategoryEvent(
                    category,
                    CategoryNotificationEvent.Action.UPDATE);

            categoryNotificationProducer.sendEvent(event);
            log.info("Sent category updated notification for categoryId: {}, userId: {}",
                    category.getId(), category.getUserId());
        } catch (Exception e) {
            log.error("Failed to send category updated notification for categoryId: {}",
                    category.getId(), e);
        }
    }

    /**
     * Send notification when category is deleted
     */
    public void sendCategoryDeletedNotification(Integer categoryId, Integer userId, String categoryName) {
        try {
            CategoryNotificationEvent event = CategoryNotificationEvent.builder()
                    .categoryId(categoryId)
                    .userId(userId)
                    .action(CategoryNotificationEvent.Action.DELETE)
                    .categoryName(categoryName)
                    .timestamp(LocalDateTime.now())
                    .build();

            categoryNotificationProducer.sendEvent(event);
            log.info("Sent category deleted notification for categoryId: {}, userId: {}",
                    categoryId, userId);
        } catch (Exception e) {
            log.error("Failed to send category deleted notification for categoryId: {}",
                    categoryId, e);
        }
    }

    /**
     * Send notification when multiple categories are created in bulk
     */
    public void sendBulkCategoriesCreatedNotification(List<Category> categories, Integer userId) {
        if (categories == null || categories.isEmpty()) {
            return;
        }
        try {
            // Send individual notifications for each category (respecting user preferences)
            for (Category category : categories) {
                sendCategoryCreatedNotification(category);
            }
            log.info("Sent bulk category created notifications for {} categories, userId: {}",
                    categories.size(), userId);
        } catch (Exception e) {
            log.error("Failed to send bulk category created notifications for userId: {}", userId, e);
        }
    }

    /**
     * Send notification when multiple categories are updated in bulk
     */
    public void sendBulkCategoriesUpdatedNotification(List<Category> categories, Integer userId) {
        if (categories == null || categories.isEmpty()) {
            return;
        }
        try {
            for (Category category : categories) {
                sendCategoryUpdatedNotification(category);
            }
            log.info("Sent bulk category updated notifications for {} categories, userId: {}",
                    categories.size(), userId);
        } catch (Exception e) {
            log.error("Failed to send bulk category updated notifications for userId: {}", userId, e);
        }
    }

    /**
     * Send notification when multiple categories are deleted in bulk
     */
    public void sendBulkCategoriesDeletedNotification(List<Integer> categoryIds, Integer userId,
            List<String> categoryNames) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return;
        }
        try {
            for (int i = 0; i < categoryIds.size(); i++) {
                String name = (categoryNames != null && i < categoryNames.size()) ? categoryNames.get(i) : null;
                sendCategoryDeletedNotification(categoryIds.get(i), userId, name);
            }
            log.info("Sent bulk category deleted notifications for {} categories, userId: {}",
                    categoryIds.size(), userId);
        } catch (Exception e) {
            log.error("Failed to send bulk category deleted notifications for userId: {}", userId, e);
        }
    }

    /**
     * Send notification when all categories are deleted
     */
    public void sendAllCategoriesDeletedNotification(Integer userId, int count) {
        try {
            CategoryNotificationEvent event = CategoryNotificationEvent.builder()
                    .categoryId(null)
                    .userId(userId)
                    .action(CategoryNotificationEvent.Action.DELETE)
                    .categoryName(String.format("All categories (%d items)", count))
                    .timestamp(LocalDateTime.now())
                    .build();

            categoryNotificationProducer.sendEvent(event);
            log.info("Sent all categories deleted notification for userId: {}, count: {}", userId, count);
        } catch (Exception e) {
            log.error("Failed to send all categories deleted notification for userId: {}", userId, e);
        }
    }

    /**
     * Build category notification event from Category entity
     */
    private CategoryNotificationEvent buildCategoryEvent(Category category, String action) {
        CategoryNotificationEvent.CategoryNotificationEventBuilder builder = CategoryNotificationEvent.builder()
                .categoryId(category.getId())
                .userId(category.getUserId())
                .action(action)
                .categoryName(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .color(category.getColor())
                .timestamp(LocalDateTime.now());

        // Build metadata JSON with additional info
        try {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("categoryName", category.getName());
            if (category.getDescription() != null) {
                metadata.put("description", category.getDescription());
            }
            if (category.getType() != null) {
                metadata.put("type", category.getType());
            }
            builder.metadata(objectMapper.writeValueAsString(metadata));
        } catch (Exception e) {
            log.warn("Failed to build metadata for category notification", e);
        }

        return builder.build();
    }
}
