package com.jaya.util;

import com.jaya.dto.UserDto;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Component
public class ServiceHelper {

    @Autowired
    private UserService userService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    public UserDto validateUser(Integer userId) throws Exception {
        UserDto reqUser = userService.getUserProfileById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return reqUser;
    }

    // Chat muting methods
    public void muteUserChat(Integer userId, Integer chatPartnerId, Long muteUntil) {
        String key = "muted_chat:user:" + userId + ":partner:" + chatPartnerId;
        if (muteUntil != null) {
            redisTemplate.opsForValue().set(key, muteUntil, muteUntil - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
        } else {
            redisTemplate.opsForValue().set(key, -1L); // Mute indefinitely
        }
    }

    public void muteGroupChat(Integer userId, Integer groupId, Long muteUntil) {
        String key = "muted_chat:user:" + userId + ":group:" + groupId;
        if (muteUntil != null) {
            redisTemplate.opsForValue().set(key, muteUntil, muteUntil - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
        } else {
            redisTemplate.opsForValue().set(key, -1L); // Mute indefinitely
        }
    }

    public void unmuteUserChat(Integer userId, Integer chatPartnerId) {
        String key = "muted_chat:user:" + userId + ":partner:" + chatPartnerId;
        redisTemplate.delete(key);
    }

    public void unmuteGroupChat(Integer userId, Integer groupId) {
        String key = "muted_chat:user:" + userId + ":group:" + groupId;
        redisTemplate.delete(key);
    }

    public boolean isUserChatMuted(Integer userId, Integer chatPartnerId) {
        String key = "muted_chat:user:" + userId + ":partner:" + chatPartnerId;
        Object muteUntil = redisTemplate.opsForValue().get(key);

        if (muteUntil == null) {
            return false;
        }

        if (muteUntil.equals(-1L)) {
            return true; // Muted indefinitely
        }

        Long muteTime = (Long) muteUntil;
        if (muteTime > System.currentTimeMillis()) {
            return true;
        } else {
            // Mute period expired, remove the key
            redisTemplate.delete(key);
            return false;
        }
    }

    public boolean isGroupChatMuted(Integer userId, Integer groupId) {
        String key = "muted_chat:user:" + userId + ":group:" + groupId;
        Object muteUntil = redisTemplate.opsForValue().get(key);

        if (muteUntil == null) {
            return false;
        }

        if (muteUntil.equals(-1L)) {
            return true; // Muted indefinitely
        }

        Long muteTime = (Long) muteUntil;
        if (muteTime > System.currentTimeMillis()) {
            return true;
        } else {
            // Mute period expired, remove the key
            redisTemplate.delete(key);
            return false;
        }
    }

    // Chat archiving methods
    public void archiveUserChat(Integer userId, Integer chatPartnerId) {
        String key = "archived_chats:user:" + userId;
        String chatKey = "user_" + chatPartnerId;
        redisTemplate.opsForSet().add(key, chatKey);
    }

    public void archiveGroupChat(Integer userId, Integer groupId) {
        String key = "archived_chats:user:" + userId;
        String chatKey = "group_" + groupId;
        redisTemplate.opsForSet().add(key, chatKey);
    }

    public void unarchiveUserChat(Integer userId, Integer chatPartnerId) {
        String key = "archived_chats:user:" + userId;
        String chatKey = "user_" + chatPartnerId;
        redisTemplate.opsForSet().remove(key, chatKey);
    }

    public void unarchiveGroupChat(Integer userId, Integer groupId) {
        String key = "archived_chats:user:" + userId;
        String chatKey = "group_" + groupId;
        redisTemplate.opsForSet().remove(key, chatKey);
    }

    public List<Integer> getArchivedChats(Integer userId) {
        String key = "archived_chats:user:" + userId;
        Set<Object> archivedChats = redisTemplate.opsForSet().members(key);

        List<Integer> chatIds = new ArrayList<>();
        if (archivedChats != null) {
            for (Object chat : archivedChats) {
                String chatStr = chat.toString();
                if (chatStr.startsWith("user_") || chatStr.startsWith("group_")) {
                    try {
                        Integer chatId = Integer.parseInt(chatStr.substring(chatStr.indexOf("_") + 1));
                        chatIds.add(chatId);
                    } catch (NumberFormatException e) {
                        // Skip invalid entries
                    }
                }
            }
        }
        return chatIds;
    }

    // User presence methods
    public void updateUserPresence(Integer userId, String status) {
        String key = "user_presence:" + userId;
        Map<String, Object> presenceData = new HashMap<>();
        presenceData.put("status", status);
        presenceData.put("lastSeen", LocalDateTime.now().toString());
        presenceData.put("timestamp", System.currentTimeMillis());

        redisTemplate.opsForHash().putAll(key, presenceData);
        redisTemplate.expire(key, 24, TimeUnit.HOURS); // Expire after 24 hours
    }

    public String getUserPresence(Integer userId) {
        String key = "user_presence:" + userId;
        Object status = redisTemplate.opsForHash().get(key, "status");
        Object timestamp = redisTemplate.opsForHash().get(key, "timestamp");

        if (status == null) {
            return "OFFLINE";
        }

        // Check if presence data is recent (within last 5 minutes for ONLINE status)
        if (timestamp != null) {
            Long lastUpdate = Long.parseLong(timestamp.toString());
            long currentTime = System.currentTimeMillis();
            long timeDiff = currentTime - lastUpdate;

            if ("ONLINE".equals(status.toString()) && timeDiff > 300000) { // 5 minutes
                return "AWAY";
            } else if (timeDiff > 1800000) { // 30 minutes
                return "OFFLINE";
            }
        }

        return status.toString();
    }

    // Utility methods for chat management
    public boolean isChatArchived(Integer userId, Integer chatId, String chatType) {
        String key = "archived_chats:user:" + userId;
        String chatKey = chatType.toLowerCase() + "_" + chatId;
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(key, chatKey));
    }

    public void clearUserPresence(Integer userId) {
        String key = "user_presence:" + userId;
        redisTemplate.delete(key);
    }

    public Map<String, Object> getUserPresenceDetails(Integer userId) {
        String key = "user_presence:" + userId;
        Map<Object, Object> presenceData = redisTemplate.opsForHash().entries(key);

        Map<String, Object> result = new HashMap<>();
        if (presenceData != null && !presenceData.isEmpty()) {
            for (Map.Entry<Object, Object> entry : presenceData.entrySet()) {
                result.put(entry.getKey().toString(), entry.getValue());
            }
        }

        return result;
    }

    // Batch operations
    public void muteMultipleChats(Integer userId, List<Integer> chatIds, String chatType, Long muteUntil) {
        for (Integer chatId : chatIds) {
            if ("USER".equals(chatType)) {
                muteUserChat(userId, chatId, muteUntil);
            } else if ("GROUP".equals(chatType)) {
                muteGroupChat(userId, chatId, muteUntil);
            }
        }
    }

    public void archiveMultipleChats(Integer userId, List<Integer> chatIds, String chatType) {
        for (Integer chatId : chatIds) {
            if ("USER".equals(chatType)) {
                archiveUserChat(userId, chatId);
            } else if ("GROUP".equals(chatType)) {
                archiveGroupChat(userId, chatId);
            }
        }
    }

    // Chat settings management
    public void setChatNotificationSettings(Integer userId, Integer chatId, String chatType, Map<String, Object> settings) {
        String key = "chat_settings:user:" + userId + ":" + chatType.toLowerCase() + ":" + chatId;
        redisTemplate.opsForHash().putAll(key, settings);
    }

    public Map<String, Object> getChatNotificationSettings(Integer userId, Integer chatId, String chatType) {
        String key = "chat_settings:user:" + userId + ":" + chatType.toLowerCase() + ":" + chatId;
        Map<Object, Object> settings = redisTemplate.opsForHash().entries(key);

        Map<String, Object> result = new HashMap<>();
        if (settings != null) {
            for (Map.Entry<Object, Object> entry : settings.entrySet()) {
                result.put(entry.getKey().toString(), entry.getValue());
            }
        }

        return result;
    }

    // Cleanup methods
    public void cleanupExpiredMutes() {
        // This method can be called periodically to clean up expired mute entries
        Set<String> keys = redisTemplate.keys("muted_chat:*");
        if (keys != null) {
            for (String key : keys) {
                Object muteUntil = redisTemplate.opsForValue().get(key);
                if (muteUntil != null && !muteUntil.equals(-1L)) {
                    Long muteTime = (Long) muteUntil;
                    if (muteTime <= System.currentTimeMillis()) {
                        redisTemplate.delete(key);
                    }
                }
            }
        }
    }

    public void cleanupOfflineUsers() {
        // Clean up presence data for users who have been offline for too long
        Set<String> keys = redisTemplate.keys("user_presence:*");
        if (keys != null) {
            for (String key : keys) {
                Object timestamp = redisTemplate.opsForHash().get(key, "timestamp");
                if (timestamp != null) {
                    Long lastUpdate = Long.parseLong(timestamp.toString());
                    long currentTime = System.currentTimeMillis();
                    if (currentTime - lastUpdate > 86400000) { // 24 hours
                        redisTemplate.delete(key);
                    }
                }
            }
        }
    }

    // User validation with Feign client (enhanced version)
    public void validateUsers(List<Integer> userIds) throws Exception {
        for (Integer userId : userIds) {
            validateUser(userId);
        }
    }

    // Check if user exists without throwing exception
    public boolean userExists(Integer userId) {
        try {
            UserDto user = userService.getUserProfileById(userId);
            return user != null;
        } catch (Exception e) {
            return false;
        }
    }

    // Get multiple users at once
    public Map<Integer, UserDto> getMultipleUsers(List<Integer> userIds) {
        Map<Integer, UserDto> users = new HashMap<>();
        for (Integer userId : userIds) {
            try {
                UserDto user = userService.getUserProfileById(userId);
                if (user != null) {
                    users.put(userId, user);
                }
            } catch (Exception e) {
                // Skip users that can't be retrieved
            }
        }
        return users;
    }
}