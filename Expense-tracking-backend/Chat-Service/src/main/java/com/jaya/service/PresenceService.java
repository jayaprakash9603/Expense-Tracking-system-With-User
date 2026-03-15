package com.jaya.service;

import com.jaya.common.cache.KeyValueStorePort;
import org.springframework.beans.factory.annotation.Autowired;
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
    private KeyValueStorePort keyValueStore;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Map<Integer, LocalDateTime> onlineUsers = new ConcurrentHashMap<>();
    private final Map<Integer, LocalDateTime> lastSeenMap = new ConcurrentHashMap<>();
    private final Map<Integer, Set<String>> userSessions = new ConcurrentHashMap<>();

    public void setUserOnline(Integer userId, String sessionId) {
        if (userId == null) return;

        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
        onlineUsers.put(userId, LocalDateTime.now());

        if (keyValueStore != null) {
            try {
                keyValueStore.addToSet(ONLINE_USERS_KEY, userId.toString());
            } catch (Exception e) {
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

                if (keyValueStore != null) {
                    try {
                        keyValueStore.removeFromSet(ONLINE_USERS_KEY, userId.toString());
                        keyValueStore.set(
                            LAST_SEEN_PREFIX + userId,
                            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                        );
                    } catch (Exception e) {
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

        if (keyValueStore != null) {
            try {
                return keyValueStore.getSetMembers(ONLINE_USERS_KEY).contains(userId.toString());
            } catch (Exception e) {
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

        if (keyValueStore != null) {
            try {
                String stored = keyValueStore.get(LAST_SEEN_PREFIX + userId, String.class).orElse(null);
                if (stored != null) {
                    return LocalDateTime.parse(stored, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                }
            } catch (Exception e) {
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

        if (keyValueStore != null) {
            try {
                Set<String> redisOnline = keyValueStore.getSetMembers(ONLINE_USERS_KEY);
                if (redisOnline != null) {
                    result.addAll(redisOnline.stream()
                        .map(Integer::parseInt)
                        .collect(Collectors.toSet()));
                }
            } catch (Exception e) {
            }
        }

        return result;
    }

    public void heartbeat(Integer userId) {
        if (userId == null) return;
        onlineUsers.put(userId, LocalDateTime.now());

        if (keyValueStore != null) {
            try {
                keyValueStore.addToSet(ONLINE_USERS_KEY, userId.toString());
            } catch (Exception e) {
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
