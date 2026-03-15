package com.jaya.controller;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.service.FriendShipService;
import com.jaya.service.PresenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.jaya.testutil.ChatTestDataFactory.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PresenceController.class)
class PresenceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PresenceService presenceService;

    @MockBean
    private IUserServiceClient userClient;

    @MockBean
    private FriendShipService friendshipService;

    private UserDTO reqUser;

    @BeforeEach
    void setUp() {
        reqUser = buildUser();
        when(userClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
    }

    @Nested
    @DisplayName("GET /api/chats/presence/{userId}")
    class GetUserPresence {

        @Test
        @DisplayName("shouldReturnPresenceInfo")
        void shouldReturnPresenceInfo() throws Exception {
            when(presenceService.isUserOnline(2)).thenReturn(true);

            mockMvc.perform(get("/api/chats/presence/2")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.online").value(true));
        }

        @Test
        @DisplayName("shouldReturnLastSeenWhenOffline")
        void shouldReturnLastSeenWhenOffline() throws Exception {
            LocalDateTime lastSeen = LocalDateTime.of(2025, 3, 10, 12, 0);
            when(presenceService.isUserOnline(2)).thenReturn(false);
            when(presenceService.getLastSeen(2)).thenReturn(lastSeen);

            mockMvc.perform(get("/api/chats/presence/2")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.online").value(false))
                    .andExpect(jsonPath("$.lastSeen").exists());
        }
    }

    @Nested
    @DisplayName("POST /api/chats/presence/heartbeat")
    class Heartbeat {

        @Test
        @DisplayName("shouldReturn200")
        void shouldReturn200() throws Exception {
            mockMvc.perform(post("/api/chats/presence/heartbeat")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/chats/presence/online")
    class GetOnlineUsers {

        @Test
        @DisplayName("shouldReturnOnlineUsers")
        void shouldReturnOnlineUsers() throws Exception {
            when(presenceService.getAllOnlineUsers()).thenReturn(Set.of(1, 2));

            mockMvc.perform(get("/api/chats/presence/online")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    @DisplayName("GET /api/chats/presence/friends")
    class GetFriendsPresence {

        @Test
        @DisplayName("shouldReturnFriendsPresence")
        void shouldReturnFriendsPresence() throws Exception {
            when(friendshipService.getFriendIds(reqUser.getId())).thenReturn(List.of(2, 3));
            when(presenceService.getPresenceInfoForUsers(anyList())).thenReturn(Map.of(
                    2, Map.of("online", true),
                    3, Map.of("online", false, "lastSeen", "2025-03-10T12:00:00")
            ));

            mockMvc.perform(get("/api/chats/presence/friends")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.friends").exists());
        }
    }
}
