package com.jaya.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.messaging.MessagingPort;
import com.jaya.events.CategoryDeletionEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CategoryEventProducer {

    private static final Logger logger = LoggerFactory.getLogger(CategoryEventProducer.class);
    private static final String CATEGORY_DELETION_TOPIC = "category-deletion-events";

    @Autowired
    private MessagingPort messagingPort;

    @Autowired
    private ObjectMapper objectMapper;

    public void publishCategoryDeletionEvent(Integer deletedCategoryId,
                                             String deletedCategoryName,
                                             Integer userId,
                                             List<Integer> affectedExpenseIds,
                                             Integer targetCategoryId,
                                             String targetCategoryName,
                                             String eventType) {
        try {
            CategoryDeletionEvent event = new CategoryDeletionEvent(
                    deletedCategoryId,
                    deletedCategoryName,
                    userId,
                    affectedExpenseIds,
                    targetCategoryId,
                    targetCategoryName,
                    LocalDateTime.now(),
                    eventType
            );

            String eventJson = objectMapper.writeValueAsString(event);
            String key = String.format("user-%d-category-%d", userId, deletedCategoryId);

            messagingPort.send(CATEGORY_DELETION_TOPIC, key, eventJson);
            logger.info("Category deletion event published successfully: {}", key);

        } catch (JsonProcessingException e) {
            logger.error("Error serializing category deletion event", e);
        }
    }
}
