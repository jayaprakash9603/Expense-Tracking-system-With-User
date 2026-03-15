package com.jaya.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PresenceServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private SetOperations<String, String> setOperations;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private PresenceService presenceService;

    @BeforeEach
    void setUp() {
        presenceService = new PresenceService();
        ReflectionTestUtils.setField(presenceService, "redisTemplate", redisTemplate);
        ReflectionTestUtils.setField(presenceService, "messagingTemplate", messagingTemplate);
        when(redisTemplate.opsForSet()).thenReturn(setOperations);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(setOperations.members(anyString())).thenReturn(Set.of());
    }

    @Nested
    @DisplayName("setUserOnline / isUserOnline")
    class OnlineStatus {

        @Test
        @DisplayName("shouldSetUserOnline")
        void shouldSetUserOnline() {
            presenceService.setUserOnline(1, "session1");

            assertThat(presenceService.isUserOnline(1)).isTrue();
        }

        @Test
        @DisplayName("shouldSetUserOfflineWhenLastSessionRemoved")
        void shouldSetUserOfflineWhenLastSessionRemoved() {
            presenceService.setUserOnline(1, "s1");
            presenceService.setUserOffline(1, "s1");

            assertThat(presenceService.isUserOnline(1)).isFalse();
        }

        @Test
        @DisplayName("shouldRemainOnlineWhenOneOfMultipleSessionsRemoved")
        void shouldRemainOnlineWhenOneOfMultipleSessionsRemoved() {
            presenceService.setUserOnline(1, "s1");
            presenceService.setUserOnline(1, "s2");
            presenceService.setUserOffline(1, "s1");

            assertThat(presenceService.isUserOnline(1)).isTrue();
        }
    }

    @Nested
    @DisplayName("getLastSeen")
    class LastSeen {

        @Test
        @DisplayName("shouldReturnNullLastSeenWhenUserOnline")
        void shouldReturnNullLastSeenWhenUserOnline() {
            presenceService.setUserOnline(1, "s1");

            assertThat(presenceService.getLastSeen(1)).isNull();
        }

        @Test
        @DisplayName("shouldReturnLastSeenAfterGoingOffline")
        void shouldReturnLastSeenAfterGoingOffline() {
            presenceService.setUserOnline(1, "s1");
            presenceService.setUserOffline(1, "s1");

            assertThat(presenceService.getLastSeen(1)).isNotNull();
        }
    }

    @Nested
    @DisplayName("getAllOnlineUsers")
    class AllOnlineUsers {

        @Test
        @DisplayName("shouldReturnAllOnlineUsers")
        void shouldReturnAllOnlineUsers() {
            presenceService.setUserOnline(1, "s1");
            presenceService.setUserOnline(2, "s2");

            Set<Integer> online = presenceService.getAllOnlineUsers();

            assertThat(online).containsExactlyInAnyOrder(1, 2);
        }
    }

    @Nested
    @DisplayName("null handling")
    class NullHandling {

        @Test
        @DisplayName("shouldHandleNullUserId")
        void shouldHandleNullUserId() {
            assertThat(presenceService.isUserOnline(null)).isFalse();
            assertThat(presenceService.getLastSeen(null)).isNull();
        }
    }

    @Nested
    @DisplayName("heartbeat")
    class Heartbeat {

        @Test
        @DisplayName("shouldUpdateHeartbeat")
        void shouldUpdateHeartbeat() {
            presenceService.heartbeat(1);

            verify(redisTemplate).opsForSet();
            verify(setOperations).add(eq("chat:online_users"), eq("1"));
        }
    }
}
