package com.jaya.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class PresenceService {

    private static final String ONLINE_USERS_KEY = "chat:online_users";
    private static final String LAST_SEEN_PREFIX = "chat:last_seen:";
    private static final Duration ONLINE_TIMEOUT = Duration.ofMinutes(5);

    @Autowired(required = false)
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Map<Integer, LocalDateTime> onlineUsers = new ConcurrentHashMap<>();
    private final Map<Integer, LocalDateTime> lastSeenMap = new ConcurrentHashMap<>();
    private final Map<Integer, Set<String>> userSessions = new ConcurrentHashMap<>();

    public void setUserOnline(Integer userId, String sessionId) {
        if (userId == null) return;

        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
        onlineUsers.put(userId, LocalDateTime.now());

        if (redisTemplate != null) {
            try {
                redisTemplate.opsForSet().add(ONLINE_USERS_KEY, userId.toString());
                redisTemplate.expire(ONLINE_USERS_KEY, ONLINE_TIMEOUT);
            } catch (Exception e) {
                // Redis unavailable, use in-memory only
            }
        }

        broadcastPresenceChange(userId, true);
    }

    public void setUserOffline(Integer userId, String sessionId) {
        if (userId == null) return;

        Set<String> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
                onlineUsers.remove(userId);
                lastSeenMap.put(userId, LocalDateTime.now());

                if (redisTemplate != null) {
                    try {
                        redisTemplate.opsForSet().remove(ONLINE_USERS_KEY, userId.toString());
                        redisTemplate.opsForValue().set(
                            LAST_SEEN_PREFIX + userId,
                            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        );
                    } catch (Exception e) {
                        // Redis unavailable
                    }
                }

                broadcastPresenceChange(userId, false);
            }
        }
    }

    public boolean isUserOnline(Integer userId) {
        if (userId == null) return false;

        if (onlineUsers.containsKey(userId)) {
            return true;
        }

        if (redisTemplate != null) {
            try {
                Boolean isMember = redisTemplate.opsForSet().isMember(ONLINE_USERS_KEY, userId.toString());
                return Boolean.TRUE.equals(isMember);
            } catch (Exception e) {
                // Redis unavailable
            }
        }

        return false;
    }

    public LocalDateTime getLastSeen(Integer userId) {
        if (userId == null) return null;

        if (isUserOnline(userId)) {
            return null;
        }

        LocalDateTime lastSeen = lastSeenMap.get(userId);
        if (lastSeen != null) {
            return lastSeen;
        }

        if (redisTemplate != null) {
            try {
                String stored = redisTemplate.opsForValue().get(LAST_SEEN_PREFIX + userId);
                if (stored != null) {
                    return LocalDateTime.parse(stored, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                }
            } catch (Exception e) {
                // Redis unavailable
            }
        }

        return null;
    }

    public Map<Integer, Boolean> getOnlineStatusForUsers(List<Integer> userIds) {
        Map<Integer, Boolean> result = new HashMap<>();
        for (Integer userId : userIds) {
            result.put(userId, isUserOnline(userId));
        }
        return result;
    }

    public Map<Integer, Object> getPresenceInfoForUsers(List<Integer> userIds) {
        Map<Integer, Object> result = new HashMap<>();
        for (Integer userId : userIds) {
            Map<String, Object> info = new HashMap<>();
            boolean online = isUserOnline(userId);
            info.put("online", online);
            if (!online) {
                LocalDateTime lastSeen = getLastSeen(userId);
                if (lastSeen != null) {
                    info.put("lastSeen", lastSeen.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                }
            }
            result.put(userId, info);
        }
        return result;
    }

    public Set<Integer> getAllOnlineUsers() {
        Set<Integer> result = new HashSet<>(onlineUsers.keySet());

        if (redisTemplate != null) {
            try {
                Set<String> redisOnline = redisTemplate.opsForSet().members(ONLINE_USERS_KEY);
                if (redisOnline != null) {
                    result.addAll(redisOnline.stream()
                        .map(Integer::parseInt)
                        .collect(Collectors.toSet()));
                }
            } catch (Exception e) {
                // Redis unavailable
            }
        }

        return result;
    }

    public void heartbeat(Integer userId) {
        if (userId == null) return;
        onlineUsers.put(userId, LocalDateTime.now());

        if (redisTemplate != null) {
            try {
                redisTemplate.opsForSet().add(ONLINE_USERS_KEY, userId.toString());
            } catch (Exception e) {
                // Redis unavailable
            }
        }
    }

    private void broadcastPresenceChange(Integer userId, boolean isOnline) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("online", isOnline);
        if (!isOnline) {
            payload.put("lastSeen", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        messagingTemplate.convertAndSend("/topic/presence", payload);
    }

    public void updateUserActivity(Integer userId) {
        if (userId != null && onlineUsers.containsKey(userId)) {
            onlineUsers.put(userId, LocalDateTime.now());
        }
    }
}
