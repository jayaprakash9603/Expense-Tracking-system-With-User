package com.jaya.websocket;

import com.jaya.dto.StoryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;





@Service
@RequiredArgsConstructor
@Slf4j
public class StoryWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    
    private static final String GLOBAL_STORIES_TOPIC = "/topic/stories/global";
    private static final String USER_STORIES_TOPIC = "/topic/stories/user/%d";

    


    public void broadcastStoryCreated(StoryDTO story) {
        try {
            Map<String, Object> message = createMessage("STORY_CREATED", story);
            messagingTemplate.convertAndSend(GLOBAL_STORIES_TOPIC, message);
            log.info("Broadcasted STORY_CREATED event: {}", story.getId());
        } catch (Exception e) {
            log.error("Failed to broadcast story created event", e);
        }
    }

    


    public void broadcastStoryUpdated(StoryDTO story) {
        try {
            Map<String, Object> message = createMessage("STORY_UPDATED", story);
            messagingTemplate.convertAndSend(GLOBAL_STORIES_TOPIC, message);
            log.info("Broadcasted STORY_UPDATED event: {}", story.getId());
        } catch (Exception e) {
            log.error("Failed to broadcast story updated event", e);
        }
    }

    


    public void broadcastStoryDeleted(UUID storyId) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "STORY_DELETED");
            message.put("storyId", storyId.toString());
            message.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(GLOBAL_STORIES_TOPIC, message);
            log.info("Broadcasted STORY_DELETED event: {}", storyId);
        } catch (Exception e) {
            log.error("Failed to broadcast story deleted event", e);
        }
    }

    


    public void broadcastStoryExpired(UUID storyId) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "STORY_EXPIRED");
            message.put("storyId", storyId.toString());
            message.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(GLOBAL_STORIES_TOPIC, message);
            log.info("Broadcasted STORY_EXPIRED event: {}", storyId);
        } catch (Exception e) {
            log.error("Failed to broadcast story expired event", e);
        }
    }

    


    public void sendStoryToUser(Integer userId, StoryDTO story) {
        try {
            Map<String, Object> message = createMessage("STORY_CREATED", story);
            String destination = String.format(USER_STORIES_TOPIC, userId);
            messagingTemplate.convertAndSend(destination, message);
            log.info("Sent story {} to user {}", story.getId(), userId);
        } catch (Exception e) {
            log.error("Failed to send story to user {}", userId, e);
        }
    }

    


    public void sendStoryUpdateToUser(Integer userId, StoryDTO story) {
        try {
            Map<String, Object> message = createMessage("STORY_UPDATED", story);
            String destination = String.format(USER_STORIES_TOPIC, userId);
            messagingTemplate.convertAndSend(destination, message);
            log.info("Sent story update {} to user {}", story.getId(), userId);
        } catch (Exception e) {
            log.error("Failed to send story update to user {}", userId, e);
        }
    }

    


    public void sendStoryDeletionToUser(Integer userId, UUID storyId) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "STORY_DELETED");
            message.put("storyId", storyId.toString());
            message.put("timestamp", System.currentTimeMillis());

            String destination = String.format(USER_STORIES_TOPIC, userId);
            messagingTemplate.convertAndSend(destination, message);
            log.info("Sent story deletion {} to user {}", storyId, userId);
        } catch (Exception e) {
            log.error("Failed to send story deletion to user {}", userId, e);
        }
    }

    


    public void broadcastRefreshStories() {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "REFRESH_STORIES");
            message.put("timestamp", System.currentTimeMillis());

            messagingTemplate.convertAndSend(GLOBAL_STORIES_TOPIC, message);
            log.info("Broadcasted REFRESH_STORIES event");
        } catch (Exception e) {
            log.error("Failed to broadcast refresh stories event", e);
        }
    }

    private Map<String, Object> createMessage(String type, StoryDTO story) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("story", story);
        message.put("timestamp", System.currentTimeMillis());
        return message;
    }
}
